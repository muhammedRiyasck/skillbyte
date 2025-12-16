import { Job } from 'bull';
import { jobQueueService } from '../JobQueueService';
import { EmailJobData, JOB_NAMES, QUEUE_NAMES } from '../JobTypes';
import { NodeMailerService } from '../../mail/NodeMailerService';
import logger from '../../../utils/Logger';

export class EmailProcessor {
  private _nodeMailer: NodeMailerService;

  constructor() {
    this._nodeMailer = new NodeMailerService();
    this._registerProcessor();
  }

  private _registerProcessor(): void {
    jobQueueService.processJob(
      QUEUE_NAMES.EMAIL,
      JOB_NAMES.SEND_EMAIL,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this._processEmail.bind(this) as any,
    );
  }

  private async _processEmail(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, html } = job.data;

    try {
      logger.info(`Processing email to ${to} with subject: ${subject}`);

      await this._nodeMailer.sendMail(to, subject, html);

      logger.info(`Email sent successfully to ${to}`);
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw error; // Re-throw to mark job as failed
    }
  }
}
