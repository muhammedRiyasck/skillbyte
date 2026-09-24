import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';
import logger from './Logger';

export interface TranscodeResult {
  m3u8Path: string;
  folderPath: string;
  resolutions: string[];
}

/** Handles hls transcoder functionality. */
export class HlsTranscoder {
  /**
   * Transcode for the HlsTranscoder entity.
   *
   * @param inputPath - The input path information.
   * @param outputFolder - The output folder information.
   * @returns The result of the operation.
   */
  static async transcode(
    inputPath: string,
    outputFolder: string,
  ): Promise<TranscodeResult> {
    await fs.mkdir(outputFolder, { recursive: true });

    const allResolutions = [
      {
        name: '1080p',
        width: 1920,
        height: 1080,
        videoBitrate: '5000k',
        audioBitrate: '192k',
        bandwidth: 5500000,
      },
      {
        name: '720p',
        width: 1280,
        height: 720,
        videoBitrate: '2800k',
        audioBitrate: '128k',
        bandwidth: 2996000,
      },
      {
        name: '480p',
        width: 854,
        height: 480,
        videoBitrate: '1400k',
        audioBitrate: '128k',
        bandwidth: 1550000,
      },
      // 144p keeps lesson startup responsive on slow or unstable networks.
      {
        name: '144p',
        width: 256,
        height: 144,
        videoBitrate: '180k',
        audioBitrate: '48k',
        bandwidth: 250000,
      },
    ];

    logger.info(`Starting HLS transcode for: ${inputPath}`);

    // Probe the input to find the original video height so we don't upscale.
    const metadata = await new Promise<ffmpeg.FfprobeData>(
      (resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      },
    );
    const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
    const originalHeight = videoStream?.height ?? 1080;

    // Only transcode to resolutions at or below the source resolution.
    let targetResolutions = allResolutions.filter(
      (res) => res.height <= originalHeight,
    );

    // Fallback: always output at least the lowest resolution.
    if (targetResolutions.length === 0) {
      targetResolutions = [allResolutions[allResolutions.length - 1]];
    }

    logger.info(
      `Source height: ${originalHeight}px → transcoding to: ${targetResolutions.map((r) => r.name).join(', ')}`,
    );

    // Run 1 FFmpeg process at a time to prevent out-of-memory (OOM) crashes
    const limit = pLimit(1);
    await Promise.all(
      targetResolutions.map((res) =>
        limit(() => {
          const playlistPath = path.join(outputFolder, `${res.name}.m3u8`);

          // Only log when progress jumps by ≥5% to avoid flooding the console.
          let lastLoggedPct = -1;

          return new Promise<void>((resolve, reject) => {
            ffmpeg(inputPath)
              .videoCodec('libx264')
              .audioCodec('aac')
              .addOutputOptions([
                `-vf scale=${res.width}:${res.height}:force_original_aspect_ratio=decrease,pad=${res.width}:${res.height}:(ow-iw)/2:(oh-ih)/2`,
                `-b:v ${res.videoBitrate}`,
                `-b:a ${res.audioBitrate}`,
                '-threads 1',
                '-preset ultrafast',
                '-g 30',
                '-keyint_min 30',
                '-sc_threshold 0',
                '-hls_time 4',
                '-hls_playlist_type vod',
                '-hls_flags independent_segments',
                '-f hls',
              ])
              .output(playlistPath)
              .on('start', () => logger.info(`FFmpeg [${res.name}] started`))
              .on('progress', (p) => {
                const pct = Math.round(p.percent ?? 0);
                if (pct >= lastLoggedPct + 5) {
                  logger.info(`FFmpeg [${res.name}] progress: ${pct}%`);
                  lastLoggedPct = pct;
                }
              })
              .on('end', () => {
                logger.info(`FFmpeg [${res.name}] completed`);
                resolve();
              })
              .on('error', (err, _stdout, stderr) => {
                logger.error(`FFmpeg [${res.name}] error: ${err.message}`);
                logger.error(`FFmpeg stderr: ${stderr}`);
                reject(err);
              })
              .run();
          });
        }),
      ),
    );

    // Write master.m3u8 manually
    const masterPlaylistPath = path.join(outputFolder, 'master.m3u8');
    const masterContent = [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      ...targetResolutions.map(
        (res) =>
          `#EXT-X-STREAM-INF:BANDWIDTH=${res.bandwidth},RESOLUTION=${res.width}x${res.height},CODECS="avc1.42E01E,mp4a.40.2"\n${res.name}.m3u8`,
      ),
    ].join('\n');

    await fs.writeFile(masterPlaylistPath, masterContent, 'utf-8');

    logger.info(`Master playlist written to: ${masterPlaylistPath}`);
    return {
      m3u8Path: masterPlaylistPath,
      folderPath: outputFolder,
      resolutions: targetResolutions.map((r) => r.name),
    };
  }
}
