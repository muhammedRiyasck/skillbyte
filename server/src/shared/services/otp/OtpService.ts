import { IOtpService } from "./interfaces/IOtpService";
import {TempInstructorData} from './interfaces/ITempInstructorData '
import { TempStudentData } from "./interfaces/ITempStudentData";
import { NodeMailerService} from '../mail/NodeMailerService'
import {OtpRateLimiter} from './OtpRateLimiter'
import { otpVerificationEmailTemplate } from "../../templates/OtpVerification";
import Redis from "ioredis";
import { jobQueueService } from '../job-queue/JobQueueService';
import { JOB_NAMES, QUEUE_NAMES, EmailJobData } from '../job-queue/JobTypes';

import redisClient from "../../../shared/utils/Redis";
import { HttpError } from "../../types/HttpError";
import { HttpStatusCode } from "../../enums/HttpStatusCodes";
import logger from "../../utils/Logger";

export class RedisOtpService implements IOtpService {
  private redis: Redis;
  private rateLimiter:OtpRateLimiter;
  private NodeMailer 
  private OTP_EXPIRE // 2 minute , 1 minute for resend
  private DATA_EXPIRE = 6 * 60  

  constructor(time?:number) {
    this.redis = redisClient; // Use the shared Redis instance
    this.NodeMailer = new NodeMailerService()
    this.rateLimiter = new OtpRateLimiter()
    this.OTP_EXPIRE = time ?? 2 * 60
  }
  
  async sendOtp(email: string,name: string,subject:string): Promise<void> {
    logger.info('sendOtp: Checking rate limiter');
    const ttl = await this.rateLimiter.isBlocked(email);
    if (ttl){
      console.info(this.OTP_EXPIRE,'otp time for expire',subject)
      const time = ttl*1000
      const minutes = Math.floor(time/ 60000);
      const seconds = Math.floor((time % 60000) / 1000)
      throw new HttpError(`Please wait ${minutes}:${seconds} sec for next OTP.`, HttpStatusCode.BAD_REQUEST);
    }
    logger.info('sendOtp: Rate limiter passed');

    const otp = Math.floor(100000 + Math.random() * 900000).toString().slice(0, 4);
    logger.info('sendOtp: Setting OTP in Redis' , otp);
    await this.redis.set(`otp:${email}`, otp, "EX", this.OTP_EXPIRE);
    // Queue email sending instead of sending synchronously
    const emailData: EmailJobData = {
      to: email,
      subject: subject,
      html: otpVerificationEmailTemplate(name, otp, subject),
      instructorName: name,
    };

    logger.info('sendOtp: Adding job to queue');
    await jobQueueService.addJob(QUEUE_NAMES.EMAIL, JOB_NAMES.SEND_EMAIL, emailData);
    logger.info(`Email queued for ${email}`);

    logger.info('sendOtp: Blocking rate limiter');
    await this.rateLimiter.block(email, this.OTP_EXPIRE); // 🔒 Block for 2 mins
    logger.info('sendOtp: Completed');
  }
  
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const stored = await this.redis.get(`otp:${email}`);
    if (!stored || stored !== otp) return false;

    await this.redis.del(`otp:${email}`); 
    return true;
  }

  async storeTempData(email: string, data: TempInstructorData| TempStudentData): Promise<void> {
    await this.redis.set(`temp:instructor:${email}`, JSON.stringify(data), "EX", this.DATA_EXPIRE);
  }

  async getTempData(email: string): Promise<TempInstructorData |TempStudentData| null> {
    const raw = await this.redis.get(`temp:instructor:${email}`);
    if (!raw) return null;
    return JSON.parse(raw);
  }

  async deleteTempData(email: string): Promise<void> {
    await this.redis.del(`temp:instructor:${email}`);
  }
}
