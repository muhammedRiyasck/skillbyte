import { IOtpService } from "./interfaces/IOtpService";
import {TempInstructorData} from './interfaces/ITempInstructorData '
import { TempStudentData } from "./interfaces/ITempStudentData";
import { NodeMailerService} from '../mail/NodeMailerService'
import {OtpRateLimiter} from './OtpRateLimiter'
import { otpVerificationEmailTemplate } from "../../templates/OtpVerification";
import Redis from "ioredis";

import redisClient from "../../../shared/utils/Redis"; 
import { HttpError } from "../../types/HttpError";
import { HttpStatusCode } from "../../enums/HttpStatusCodes";

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
    const ttl = await this.rateLimiter.isBlocked(email);
    if (ttl){
      console.log(this.OTP_EXPIRE,'otp time for expire',subject)
      const time = ttl*1000 
      const minutes = Math.floor(time/ 60000);
      const seconds = Math.floor((time % 60000) / 1000)
      throw new HttpError(`Please wait ${minutes}:${seconds} sec for next OTP.`, HttpStatusCode.BAD_REQUEST);
    } 
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString().slice(0, 4);
    await this.redis.set(`otp:${email}`, otp, "EX", this.OTP_EXPIRE);
    console.log(`Generated OTP for ${email}: ${otp}`); 
    
    await this.NodeMailer.sendMail(email,subject ,otpVerificationEmailTemplate(name,otp,subject)); 
    await this.rateLimiter.block(email, this.OTP_EXPIRE); // 🔒 Block for 2 mins
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
