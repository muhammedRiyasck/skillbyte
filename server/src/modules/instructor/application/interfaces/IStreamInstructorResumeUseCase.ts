import { Readable } from 'stream';

export interface StreamResumeResult {
  stream: Readable;
  contentType: string;
}

export interface IStreamInstructorResumeUseCase {
  execute(instructorId: string): Promise<StreamResumeResult>;
}
