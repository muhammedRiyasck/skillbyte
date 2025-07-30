import { Request, Response } from "express";
import { RegisterStudentUseCase } from "../../application/use-cases/RegisterStudentUseCase";
import {LoginStudentUseCase} from '../../application/use-cases/LoginStudentUseCase';
import { RedisOtpService } from "../../../../shared/services/otp/OtpService";

export class StudentAuthController {
  constructor(
    private readonly registerStudentUseCase: RegisterStudentUseCase,
    private readonly generateOtpUseCase: RedisOtpService,
    private readonly loginUseCase: LoginStudentUseCase,
  ) {}

  // 🧑‍🎓 Student Registration
   registerStudent = async(req: Request, res: Response)=> {
    const { name, email, password } = req.body;
    const isUserExists = await this.registerStudentUseCase.isUserExists(email);
    if (!isUserExists) {
      await this.generateOtpUseCase.storeTempData(email, { name, email, password });
      await this.generateOtpUseCase.sendOtp(email,name,'student registration');
      res.status(201).json({ message: "Student registered. OTP sent to email." });
    }else {
    res.status(400).json({ message: "Email already exists" });
    }
  }

   verifyOtp = async(req: Request, res: Response) => {
    const { otp } = req.body;
    const email = req.query.email as string; 
    await this.registerStudentUseCase.execute(email,otp);
    res.status(201).json({ message: "Instructor registered successfully." });
  }
  

}

