import nodemailer from 'nodemailer';
import { IMailerService } from './IMailerService';
import { HttpError } from '../../types/HttpError';
import { ERROR_MESSAGES } from '../../constants/messages';
import logger from '../../utils/Logger';
import { HttpStatusCode } from '../../enums/HttpStatusCodes';

export class NodeMailerService implements IMailerService {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    // secure: true, // Use TLS
  });

  async sendMail(email: string, subject: string, html: string): Promise<void> {
    try {
     const result = await this.transporter.verify();
     logger.info('send mail verify',result,email,' email')
      await this.transporter.sendMail({
        from: 'SkillByte" <no-reply@skillbyte.com>',
        to: email,
        subject,
        html,
      });
    } catch (error) {
      logger.error('Error verifying email transporter:', error);
    throw new HttpError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
