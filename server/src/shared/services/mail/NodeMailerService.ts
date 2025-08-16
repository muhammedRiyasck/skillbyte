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
     const result = await this.transporter.verify();
     console.log('send mail verify',result,email,' email')
      await this.transporter.sendMail({
        from: 'SkillByte" <no-reply@skillbyte.com>',
        to: email,
        subject,
        html,
      });
    } catch (error) {
      console.error('Error verifying email transporter:', error);
      console.log(process.env.EMAIL,process.env.EMAIL_PASSWORD,)
      throw new Error('Email service is not configured properly.');
    }
  }
}
