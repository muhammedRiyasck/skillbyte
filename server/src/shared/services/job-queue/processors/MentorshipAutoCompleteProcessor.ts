import { Job } from 'bull';
import { jobQueueService } from '../JobQueueService';
import { JOB_NAMES, QUEUE_NAMES } from '../JobTypes';
import { AutoCompleteBookingsUseCase } from '../../../../modules/mentorship/application/use-cases/AutoCompleteBookingsUseCase';
import logger from '../../../utils/Logger';

export class MentorshipAutoCompleteProcessor {
  constructor(private readonly _autoCompleteUC: AutoCompleteBookingsUseCase) {
    this._registerProcessor();
  }

  private _registerProcessor(): void {
    jobQueueService.processJob(
      QUEUE_NAMES.MENTORSHIP,
      JOB_NAMES.MENTORSHIP_AUTO_COMPLETE,
      this._processAutoComplete.bind(this),
    );
  }

  private async _processAutoComplete(_job: Job<void>): Promise<void> {
    try {
      logger.info('Starting scheduled mentorship auto-completion job');
      await this._autoCompleteUC.execute();
      logger.info('Finished scheduled mentorship auto-completion job');
    } catch (error) {
      logger.error('Scheduled mentorship auto-completion job failed:', error);
      throw error;
    }
  }
}
