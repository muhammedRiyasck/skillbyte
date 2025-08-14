import { Request, Response } from "express";
import { RegisterInstructorUseCase } from "../../application/use-cases/RegisterInstructorUseCase";
// import {LoginInstructorUseCase} from '../../application/use-cases/LoginInstructorUseCase';
// import { RegisterInstructorDTO } from "../../application/dtos/RegisterInstructorDTO";
import { RedisOtpService } from "../../../../shared/services/otp/OtpService";

export class InstructorAuthController {
  constructor(
    private registerInstructorUseCase: RegisterInstructorUseCase, 
    private generateOtpUseCase: RedisOtpService , 
    // private loginUseCase: LoginInstructorUseCase 
  ) {}

  // 🧑‍🏫 Instructor Registration
   async registerInstructor(req: Request, res: Response) {
    const { fullName,email,password,bio,profile,socialLinks,expertise,qualifications,otp} = req.body;
    const isUserExists = await this.registerInstructorUseCase.isUserExists(email);
    if (!isUserExists) {
      await this.generateOtpUseCase.storeTempData(email, {fullName, email, password, bio, profilePictureUrl:profile, socialLinks, expertise, qualifications });
      await this.generateOtpUseCase.sendOtp(email,fullName,'Instructor Registration OTP');
      res.status(201).json({ message: "Instructor registered. OTP sent to email." });
    }else {
      res.status(400).json({ message: "Email already exists" });
    }
  }
  async verifyOtp(req: Request, res: Response) {
    const { otp,email } = req.body;
    
    await this.registerInstructorUseCase.execute(email,otp);
    res.status(201).json({ message: "Instructor registered successfully." });
  }
  
  // 🧑‍🏫 Instructor Login
  // async loginInstructor(req: Request, res: Response) {
  //   const { email, password } = req.body;
  //   const token = await this.loginUseCase.execute(email, password);
  //   res.status(200).json({ token }); 
  // }
  

  //   async requestOtp(req: Request, res: Response) {
  //   const dto: RegisterInstructorDTO = req.body;
  //   await this.requestOtpUseCase.execute(dto);
  //   res.status(200).json({ message: "OTP sent to email. Complete registration after verifying." });
  // }

}
