import Queue from 'bull';
import fs from 'fs/promises';
import path from 'path';
import logger from '../../../utils/Logger';
import { S3StorageService } from '../../file-upload/services/S3StorageService';
import { HlsTranscoder } from '../../../utils/HlsTranscoder';
import { LessonModel } from '../../../../modules/course/infrastructure/models/LessonModel';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../../../config/backblaze/S3Client';
import pLimit from 'p-limit';

export interface VideoTranscodeJobData {
  lessonId: string;
  sourceKey: string;
}

export class VideoTranscodeProcessor {
  static async process(job: Queue.Job<VideoTranscodeJobData>): Promise<void> {
    const { lessonId, sourceKey } = job.data;
    logger.info(
      `Starting video transcode job for lesson ${lessonId}, source: ${sourceKey}`,
    );

    const s3Service = new S3StorageService();
    const tempDir = path.join(process.cwd(), 'temp-transcode', lessonId);
    const inputPath = path.join(tempDir, 'input.mp4');
    const outputFolder = path.join(tempDir, 'hls');

    try {
      // 1. Create temp directories
      await fs.mkdir(tempDir, { recursive: true });
      await fs.mkdir(outputFolder, { recursive: true });

      // 2. Download the raw MP4 from S3
      logger.info(`Downloading source video for lesson ${lessonId}`);
      await s3Service.download(sourceKey, inputPath);

      // 3. Transcode to HLS
      logger.info(`Transcoding video for lesson ${lessonId}`);
      const baseUrl = process.env.BASE_URL?.replace(/\/$/, '');
      if (!baseUrl) {
        throw new Error('BASE_URL must be configured to transcode HLS media');
      }
      const hlsProxyBaseUrl = `${baseUrl}/api/v1/course/lesson/${lessonId}/hls`;
      await HlsTranscoder.transcode(inputPath, outputFolder, hlsProxyBaseUrl);

      // 4. Upload all HLS files back to S3
      logger.info(`Uploading HLS files to S3 for lesson ${lessonId}`);
      const filesToUpload = await fs.readdir(outputFolder);
      const s3BaseFolder = `lessons/${lessonId}/hls`;

      // Limit concurrent uploads to 10. Without this, trying to read 100+ .ts files
      // into memory and firing 100+ S3 requests all at once will overload the memory
      // and trigger Backblaze rate limits/connection timeouts.
      const uploadLimit = pLimit(50);

      const uploadPromises = filesToUpload.map((fileName) =>
        uploadLimit(async () => {
          const filePath = path.join(outputFolder, fileName);

          let contentType = 'application/octet-stream';
          if (fileName.endsWith('.m3u8')) contentType = 'application/x-mpegURL';
          else if (fileName.endsWith('.ts')) contentType = 'video/MP2T';

          // Use a Node.js read stream instead of loading the entire file into RAM
          const { createReadStream } = await import('fs');
          const fileStream = createReadStream(filePath);

          const command = new PutObjectCommand({
            Bucket: process.env.B2_S3_BUCKET!,
            Key: `${s3BaseFolder}/${fileName}`,
            Body: fileStream,
            ContentType: contentType,
          });

          await s3.send(command);
        }),
      );

      await Promise.all(uploadPromises);

      // 5. Update the Lesson document in MongoDB
      logger.info(`Updating lesson ${lessonId} in database`);
      const masterUrl = `${s3BaseFolder}/master.m3u8`;

      await LessonModel.findByIdAndUpdate(lessonId, {
        isProcessing: false,
        hlsUrl: masterUrl,
      });

      logger.info(
        `Successfully completed video transcode job for lesson ${lessonId}`,
      );
    } catch (error) {
      logger.error(
        `Error in video transcode job for lesson ${lessonId} (Attempt ${job.attemptsMade + 1}/${job.opts.attempts}):`,
        error,
      );

      // Only mark as failed in DB if we have exhausted all retries
      // This prevents setting isProcessing: false while Bull is still trying to retry the job.
      if (job.attemptsMade >= (job.opts.attempts || 3) - 1) {
        await LessonModel.findByIdAndUpdate(lessonId, {
          isProcessing: false,
        }).catch((dbErr) =>
          logger.error(
            `Failed to update lesson processing status on error:`,
            dbErr,
          ),
        );
      }

      throw error;
    } finally {
      // 6. Cleanup local temp files
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
