import { Job } from 'bull';
import { jobQueueService } from '../JobQueueService';
import { EmailJobData, JOB_NAMES, QUEUE_NAMES } from '../JobTypes';
import { NodeMailerService } from '../../mail/NodeMailerService';
import logger from '../../../utils/Logger';

export class EmailProcessor {
  private nodeMailer: NodeMailerService;

  constructor() {
    this.nodeMailer = new NodeMailerService();
    this.registerProcessor();
  }

  private registerProcessor(): void {
    jobQueueService.processJob(
      QUEUE_NAMES.EMAIL,
      JOB_NAMES.SEND_EMAIL,
      this.processEmail.bind(this) as any
    );
  }

  private async processEmail(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, html } = job.data;

    try {
      logger.info(`Processing email to ${to} with subject: ${subject}`);

      await this.nodeMailer.sendMail(to, subject, html);

      logger.info(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw error; // Re-throw to mark job as failed
    }
  }
}
