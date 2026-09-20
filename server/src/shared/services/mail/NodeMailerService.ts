import { Resend } from 'resend';
import { IMailerService } from './IMailerService';
import { HttpError } from '../../types/HttpError';
import { ERROR_MESSAGES } from '../../constants/messages';
import logger from '../../utils/Logger';
import { HttpStatusCode } from '../../enums/HttpStatusCodes';

export class NodeMailerService implements IMailerService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendMail(email: string, subject: string, html: string): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'SkillByte <no-reply@skillbyte.site>',
        to: email,
        subject,
        html,
      });

      if (error) {
        logger.error('Error from Resend API:', error);
        throw new Error(error.message);
      }

      logger.info('Email sent successfully via Resend:', data);
    } catch (error) {
      logger.error('Error sending email:', error);
      throw new HttpError(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
