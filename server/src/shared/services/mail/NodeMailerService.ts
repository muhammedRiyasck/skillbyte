import nodemailer from 'nodemailer';
import { IMailerService } from './IMailerService';

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
      await this.transporter.verify();
    } catch (error) {
      console.error('Error verifying email transporter:', error);
      throw new Error('Email service is not configured properly.');
    }
    await this.transporter.sendMail({
      from: 'SkillByte" <no-reply@skillbyte.com>',
      to: email,
      subject,
      html,
    });
  }
}
