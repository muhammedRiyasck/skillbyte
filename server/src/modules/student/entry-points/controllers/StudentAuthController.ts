import { Request, Response } from "express";
import { RegisterStudentUseCase } from "../../application/use-cases/RegisterStudentUseCase";
import { RedisOtpService } from "../../../../shared/services/otp/OtpService";

export class StudentAuthController {
  constructor(
    private readonly registerStudentUseCase: RegisterStudentUseCase,
    private readonly generateOtpUseCase: RedisOtpService,
  ) {}

  // 🧑‍🎓 Student Registration
   registerStudent = async(req: Request, res: Response)=> {
    const { fullName, email, password,confirmPassword } = req.body;
    if(password!==confirmPassword){
      res.status(400).json({message:'Confirm Password MisMatched'})
      return
    }

    const isUserExists = await this.registerStudentUseCase.isUserExists(email);
    if (!isUserExists) {
      await this.generateOtpUseCase.storeTempData(email, { fullName, email, password });
      await this.generateOtpUseCase.sendOtp(email,fullName,'student registration');
      res.status(201).json({ message: "An OTP Sented To Your Mail." });
    }else {
    res.status(400).json({ message: "Email already exists" });
    }
  }

   verifyOtp = async(req: Request, res: Response) => {
    const { Otp,email } = req.body;    
    console.log(req.body)
    await this.registerStudentUseCase.execute(email,Otp);
    res.status(201).json({ message: "Student Registration Successfull." });
  }
  

}

