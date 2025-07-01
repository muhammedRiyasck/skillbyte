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
  async registerStudent(req: Request, res: Response) {
    const { name, email, password } = req.body;
    const isUserExists = await this.registerStudentUseCase.isUserExists(email);
    if (!isUserExists) {
      await this.generateOtpUseCase.storeTempData(email, { name, email, password });
      await this.generateOtpUseCase.generateOtp(email,name);
      res.status(201).json({ message: "Student registered. OTP sent to email." });
    }else {
    res.status(400).json({ message: "Email already exists" });
    }
  }

  async verifyOtp(req: Request, res: Response) {
    const { otp } = req.body;
    const email = req.query.email as string; 
    await this.registerStudentUseCase.execute(email,otp);
    res.status(201).json({ message: "Instructor registered successfully." });
  }
  

  // async login(req: Request, res: Response) {
  //   const { email, password } = req.body;
  //   const token = await this.loginUseCase.execute(email, password);
  //   res.status(200).json({ token });
  // }

  // ✉️ Send OTP to email
  // async sendOtp(req: Request, res: Response) {
  //   const { email } = req.body;
  //   await this.generateOtpUseCase.execute(email);
  //   res.status(200).json({ message: "OTP sent to email" });
  // }

  // ✅ Verify OTP
  // async verifyOtp(req: Request, res: Response) {
  //   const { email, code } = req.body;
  //   const result = await this.verifyOtpUseCase.execute(email, code);

  //   if (!result.success) {
  //     return res.status(400).json({ message: result.message });
  //   }

  //   res.status(200).json({ message: "Email verified successfully" });
  // }

  // 🔵 Google Login/Register (Student only)
  // async googleLoginStudent(req: Request, res: Response) {
  //   const { tokenId } = req.body;
  //   const result = await this.googleLoginUseCase.execute(tokenId);
  //   res.status(200).json(result);
  // }

  // // 🔵 Facebook Login/Register (Student only)
  // async facebookLoginStudent(req: Request, res: Response) {
  //   const { accessToken, userID } = req.body;
  //   const result = await this.facebookLoginUseCase.execute(accessToken, userID);
  //   res.status(200).json(result);
  // }
}

