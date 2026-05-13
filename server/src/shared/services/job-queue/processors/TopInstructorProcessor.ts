import { ITopInstructorUseCase } from '../../../../modules/admin/application/interfaces/ITopInstructorUseCase';
import { jobQueueService } from '../JobQueueService';
import { QUEUE_NAMES, JOB_NAMES } from '../JobTypes';
import logger from '../../../utils/Logger';
import Queue from 'bull';

export class TopInstructorProcessor {
  constructor(private topInstructorUseCase: ITopInstructorUseCase) {
    this.initializeProcessor();
  }

  private initializeProcessor() {
    jobQueueService.processJob(
      QUEUE_NAMES.CLEANUP,
      JOB_NAMES.REFRESH_TOP_INSTRUCTORS,
      async (_job: Queue.Job) => {
        logger.info('Processing REFRESH_TOP_INSTRUCTORS job');
        await this.topInstructorUseCase.refreshTopInstructors();
      },
    );
  }
}
