import { Readable } from 'stream';

export interface StreamHlsResult {
  status: number;
  contentType: string;
  cacheControl: string;
  contentLength: string | null;
  stream: Readable;
}

export interface IStreamLessonHlsUseCase {
  execute(lessonId: string, file: string): Promise<StreamHlsResult>;
  prewarm(lessonId: string): void;
}
