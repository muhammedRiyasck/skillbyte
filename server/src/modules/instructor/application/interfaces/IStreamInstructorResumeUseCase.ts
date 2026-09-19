import { Readable } from 'stream';

export interface StreamResumeResult {
  url: string;
}

export interface IStreamInstructorResumeUseCase {
  execute(instructorId: string): Promise<StreamResumeResult>;
}
