import { Request, Response } from "express";
import { RegisterInstructorUseCase } from "../../application/use-cases/RegisterInstructorUseCase";
// import {LoginInstructorUseCase} from '../../application/use-cases/LoginInstructorUseCase';
// import { RegisterInstructorDTO } from "../../application/dtos/RegisterInstructorDTO";
import { RedisOtpService } from "../../../../shared/services/otp/OtpService";

export class InstructorAuthController {
  constructor(
    private readonly registerInstructorUseCase: RegisterInstructorUseCase, 
    private readonly generateOtpUseCase: RedisOtpService , 
  ) {}

  // 🧑‍🏫 Instructor Registration
    registerInstructor = async(req: Request, res: Response)=> {
     const { fullName,email,password,subject,jobTitle,socialMediaLink,experience,portfolioLink} = req.body;
     const isUserExists = await this.registerInstructorUseCase.isUserExists(email);
     
    if (!isUserExists) {
      await this.generateOtpUseCase.storeTempData(email, {fullName,email,password,subject,jobTitle,socialMediaLink,experience,portfolioLink});
      await this.generateOtpUseCase.sendOtp(email,fullName,'Instructor Registration OTP');
      res.status(201).json({ message: "An OTP sented to your mail." });
    }else {
      res.status(400).json({ message: "Email already exists" });
    }
  }

   verifyOtp = async(req: Request, res: Response) => {
    const { Otp,email } = req.body;
    await this.registerInstructorUseCase.execute(email,Otp);
    res.status(201).json({ message: "Successfully registered. You'll receive an email once approved." });
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
