import { IOtpService } from "./interfaces/IOtpService";
import {TempInstructorData} from './interfaces/ITempInstructorData '
import { TempStudentData } from "./interfaces/ITempStudentData";
import { NodeMailerService} from '../mail/NodeMailerService'
import { otpVerificationEmailTemplate } from "../../templates/OtpVerification";
import Redis from "ioredis";

import redisClient from "../../../shared/utils/Redis"; 

export class RedisOtpService implements IOtpService {
  private redis: Redis;
  private OTP_EXPIRE = 5 * 60; // 5 minutes
  private DATA_EXPIRE = 10 * 60; // 10 minutes

  constructor() {
    this.redis = redisClient; // Use the shared Redis instance
  }
  
  async sendOtp(email: string,name: string,subject:string|undefined): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    await this.redis.set(`otp:${email}`, otp, "EX", this.OTP_EXPIRE);
    
    let nodemailer = new NodeMailerService()
    await nodemailer.sendMail(email,subject = "Your SkillByte OTP Code",otpVerificationEmailTemplate(name,otp)); 
    return 
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
