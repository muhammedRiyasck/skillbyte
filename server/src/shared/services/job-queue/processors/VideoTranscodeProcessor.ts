import Queue from 'bull';
import fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../../../config/backblaze/S3Client';
import logger from '../../../utils/Logger';
import { S3StorageService } from '../../file-upload/services/S3StorageService';
import { HlsTranscoder } from '../../../utils/HlsTranscoder';
import { LessonModel } from '../../../../modules/course/infrastructure/models/LessonModel';

export interface VideoTranscodeJobData {
  lessonId: string;
  sourceKey: string;
}

/**
 * Retries an async operation with exponential backoff.
 *
 * Handles transient errors (ECONNRESET, ETIMEDOUT, Backblaze 500/503) at the
 * *operation* level — independently of Bull's job-level retry mechanism.
 * This means a brief network hiccup mid-upload won't burn a full job attempt;
 * only genuinely unrecoverable failures are escalated to Bull.
 *
 * @param fn        - Factory that produces the async operation to attempt.
 * @param maxTries  - Total number of attempts (default 5).
 * @param baseDelay - Initial backoff delay in ms, doubles per attempt (default 1500ms).
 * @param label     - Human-readable label shown in log messages.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxTries = 5,
  baseDelay = 1500,
  label = 'operation',
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxTries; attempt++) {
    try {
      return await fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      lastError = err;

      const isTransient =
        err?.code === 'ECONNRESET' ||
        err?.code === 'ETIMEDOUT' ||
        err?.code === 'ENOTFOUND' ||
        err?.code === 'EPIPE' ||
        err?.name === 'InternalError' || // Backblaze 500
        err?.$metadata?.httpStatusCode === 500 ||
        err?.$metadata?.httpStatusCode === 503;

      if (!isTransient || attempt === maxTries) {
        logger.warn(
          `[${label}] Non-transient error or max attempts reached (${attempt}/${maxTries}): ${err?.message}`,
        );
        throw err;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1); // 1.5s → 3s → 6s → 12s ...
      logger.warn(
        `[${label}] Transient error (attempt ${attempt}/${maxTries}): ${err?.message}. Retrying in ${delay}ms...`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

export class VideoTranscodeProcessor {
  static async process(job: Queue.Job<VideoTranscodeJobData>): Promise<void> {
    const { lessonId, sourceKey } = job.data;

    // Fetch the lesson to know which phase already completed (for resuming)
    const lesson = await LessonModel.findById(lessonId);
    if (!lesson) {
      logger.error(`Lesson ${lessonId} not found for transcode job.`);
      return;
    }

    const currentPhase = lesson.transcodePhase;
    logger.info(
      `Starting video transcode job for lesson ${lessonId}, source: ${sourceKey}, currentPhase: ${currentPhase || 'none'} (Attempt ${job.attemptsMade + 1}/${job.opts.attempts})`,
    );

    const s3Service = new S3StorageService();
    const tempDir = path.join(process.cwd(), 'temp-transcode', lessonId);
    const inputPath = path.join(tempDir, 'input.mp4');
    const outputFolder = path.join(tempDir, 'hls');
    const s3BaseFolder = `lessons/${lessonId}/hls`;
    const masterUrl = `${s3BaseFolder}/master.m3u8`;

    try {
      // Ensure temp dirs exist (idempotent)
      await fs.mkdir(tempDir, { recursive: true });
      await fs.mkdir(outputFolder, { recursive: true });

      // ── PHASE 1: DOWNLOAD ────────────────────────────────────────────────────
      // Temp files are wiped on process restart, so we can only skip this phase
      // if the file already exists on disk (i.e., within the same process run).
      const localFileExists = await fs
        .access(inputPath)
        .then(() => true)
        .catch(() => false);

      if (!localFileExists && currentPhase !== 'done') {
        logger.info(
          `Phase: DOWNLOAD - Fetching source video for lesson ${lessonId}`,
        );

        // Operation-level retry: handles ECONNRESET / transient network blips.
        // Each retry gets a fresh TCP connection via a new download() call.
        await withRetry(
          () => s3Service.download(sourceKey, inputPath),
          5,
          1500,
          `download:${lessonId}`,
        );

        await LessonModel.findByIdAndUpdate(lessonId, {
          transcodePhase: 'downloaded',
        });
      } else {
        logger.info(
          `Phase: DOWNLOAD - Skipped (already on disk or job already done)`,
        );
      }

      // ── PHASE 2: TRANSCODE ───────────────────────────────────────────────────
      // Same reasoning — skip only if local HLS output already exists.
      const localHlsExists = await fs
        .access(path.join(outputFolder, 'master.m3u8'))
        .then(() => true)
        .catch(() => false);

      if (!localHlsExists && currentPhase !== 'done') {
        logger.info(
          `Phase: TRANSCODE - Transcoding video for lesson ${lessonId}`,
        );
        const baseUrl = process.env.BASE_URL?.replace(/\/$/, '');
        if (!baseUrl) {
          throw new Error('BASE_URL must be configured to transcode HLS media');
        }
        const hlsProxyBaseUrl = `${baseUrl}/api/v1/course/lesson/${lessonId}/hls`;
        await HlsTranscoder.transcode(inputPath, outputFolder, hlsProxyBaseUrl);

        await LessonModel.findByIdAndUpdate(lessonId, {
          transcodePhase: 'transcoded',
        });
      } else {
        logger.info(
          `Phase: TRANSCODE - Skipped (already on disk or job already done)`,
        );
      }

      // ── PHASE 3: UPLOAD ──────────────────────────────────────────────────────
      if (currentPhase !== 'uploaded' && currentPhase !== 'done') {
        logger.info(
          `Phase: UPLOAD - Uploading HLS files to S3 for lesson ${lessonId}`,
        );
        const filesToUpload = await fs.readdir(outputFolder);

        // Cap concurrent uploads at 5 to avoid TCP congestion on poor connections.
        // 10+ parallel sockets on a flaky link triggers more ECONNRESET than it saves in time.
        const uploadLimit = pLimit(5);

        const uploadPromises = filesToUpload.map((fileName) =>
          uploadLimit(async () => {
            const fileS3Key = `${s3BaseFolder}/${fileName}`;

            // Resume: skip segments that are already in S3 (survives process restarts)
            const exists = await withRetry(
              () => s3Service.fileExists(fileS3Key),
              3,
              500,
              `existsCheck:${fileName}`,
            );
            if (exists) return;

            const filePath = path.join(outputFolder, fileName);
            let contentType = 'application/octet-stream';
            if (fileName.endsWith('.m3u8'))
              contentType = 'application/x-mpegURL';
            else if (fileName.endsWith('.ts')) contentType = 'video/MP2T';

            // Retry each segment independently.
            // The stream factory is inside the retry closure so each attempt
            // gets a fresh readable stream (streams can't be re-read after consumption).
            await withRetry(
              async () => {
                const { createReadStream } = await import('fs');
                const command = new PutObjectCommand({
                  Bucket: process.env.B2_S3_BUCKET!,
                  Key: fileS3Key,
                  Body: createReadStream(filePath),
                  ContentType: contentType,
                });
                await s3.send(command);
              },
              5,
              1000,
              `upload:${fileName}`,
            );
          }),
        );

        await Promise.all(uploadPromises);
        await LessonModel.findByIdAndUpdate(lessonId, {
          transcodePhase: 'uploaded',
        });
      } else {
        logger.info(`Phase: UPLOAD - Skipped (already uploaded to S3)`);
      }

      // ── PHASE 4: DB UPDATE ───────────────────────────────────────────────────
      if (currentPhase !== 'done') {
        logger.info(
          `Phase: DB UPDATE - Finalizing lesson ${lessonId} in database`,
        );
        await LessonModel.findByIdAndUpdate(lessonId, {
          isProcessing: false,
          hlsUrl: masterUrl,
          transcodePhase: 'done',
          $unset: { transcodeError: 1 }, // clear any previous error message
        });
        logger.info(
          `Successfully completed video transcode job for lesson ${lessonId}`,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(
        `Error in video transcode job for lesson ${lessonId} (Attempt ${job.attemptsMade + 1}/${job.opts.attempts}):`,
        error,
      );

      // Persist the failure message for debugging via the API / MongoDB
      await LessonModel.findByIdAndUpdate(lessonId, {
        transcodeError: error?.message || 'Unknown error during transcoding',
      }).catch((dbErr) =>
        logger.error(`Failed to save transcodeError:`, dbErr),
      );

      // Only set isProcessing: false after ALL Bull retries are exhausted.
      // While retries remain, leave isProcessing: true so the UI shows progress.
      if (job.attemptsMade >= (job.opts.attempts || 3) - 1) {
        await LessonModel.findByIdAndUpdate(lessonId, {
          isProcessing: false,
        }).catch((dbErr) =>
          logger.error(
            `Failed to update lesson processing status on final error:`,
            dbErr,
          ),
        );
      }

      throw error;
    } finally {
      logger.info(`Cleaning up temp files for lesson ${lessonId}`);
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupErr) {
        logger.error(
          `Failed to cleanup temp files for lesson ${lessonId}:`,
          cleanupErr,
        );
      }
    }
  }
}
