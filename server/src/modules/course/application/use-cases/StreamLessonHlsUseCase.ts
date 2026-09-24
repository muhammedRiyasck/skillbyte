import { Readable } from 'stream';
import {
  IStreamLessonHlsUseCase,
  StreamHlsResult,
} from '../interfaces/IStreamLessonHlsUseCase';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import logger from '../../../../shared/utils/Logger';

/**
 * In-memory cache for presigned B2 URLs.
 * Key: B2 object key -> Value: { url, expiresAt (ms epoch) }
 */
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

/** Executes the business logic for stream lesson hls. */
export class StreamLessonHlsUseCase implements IStreamLessonHlsUseCase {
  constructor(private readonly _storageService: IStorageService) {}

  /**
   * Execute for the StreamLessonHls entity.
   *
   * @param lessonId - The unique identifier for the lesson.
   * @param file - The file information.
   * @returns The result of the operation.
   */
  async execute(lessonId: string, file: string): Promise<StreamHlsResult> {
    const b2Key = `lessons/${lessonId}/hls/${file}`;
    const isPlaylist = file.endsWith('.m3u8');

    const now = Date.now();
    const safeguard = isPlaylist ? 300_000 : 60_000;
    const ttl = isPlaylist ? 3600 : 300;

    const cached = signedUrlCache.get(b2Key);
    let signedUrl: string;

    if (cached && cached.expiresAt - now > safeguard) {
      signedUrl = cached.url;
    } else {
      signedUrl = await this._storageService.getSignedUrl(b2Key, ttl);
      signedUrlCache.set(b2Key, {
        url: signedUrl,
        expiresAt: now + ttl * 1000,
      });
    }

    const upstream = await fetch(signedUrl);
    if (!upstream.ok || !upstream.body) {
      const errorText = await upstream.text();
      logger.error(
        `B2 fetch failed: ${upstream.status} ${upstream.statusText} - ${errorText}`,
      );
      throw new Error(`Storage returned ${upstream.status} for ${b2Key}`);
    }

    const contentType = isPlaylist
      ? 'application/vnd.apple.mpegurl'
      : 'video/mp2t';
    const cacheControl = isPlaylist
      ? 'private, max-age=5'
      : 'private, max-age=300';
    const contentLength = upstream.headers.get('content-length');

    const stream = Readable.fromWeb(
      upstream.body as unknown as import('stream/web').ReadableStream,
    );

    return {
      status: upstream.status,
      contentType,
      cacheControl,
      contentLength,
      stream,
    };
  }

  /**
   * Prewarm for the StreamLessonHls entity.
   *
   * @param lessonId - The unique identifier for the lesson.
   */
  prewarm(lessonId: string): void {
    const now = Date.now();
    const ttl = 3600;
    const masterKey = `lessons/${lessonId}/hls/master.m3u8`;
    const initialQualityKey = `lessons/${lessonId}/hls/144p.m3u8`;

    Promise.all([
      this._storageService.getSignedUrl(masterKey, ttl),
      this._storageService.getSignedUrl(initialQualityKey, ttl),
    ])
      .then(([masterSigned, initialSigned]) => {
        signedUrlCache.set(masterKey, {
          url: masterSigned,
          expiresAt: now + ttl * 1000,
        });
        signedUrlCache.set(initialQualityKey, {
          url: initialSigned,
          expiresAt: now + ttl * 1000,
        });
        logger.info(
          `Pre-warmed signed URL cache for lesson ${lessonId} (master + 144p)`,
        );
      })
      .catch((err) => {
        logger.warn(
          `Failed to pre-warm cache for lesson ${lessonId}: ${err.message}`,
        );
      });
  }
}
