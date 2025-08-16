// modules/auth/interfaces/controllers/login.controller.ts

import { Request, Response } from 'express';
import { LoginStudentUseCase } from '../../../student/application/use-cases/LoginStudentUseCase';
import { LoginInstructorUseCase } from '../../../instructor/application/use-cases/LoginInstructorUseCase';
import { AccessTokenUseCase   } from '../../application/AccessTokenUseCase';
import { ResendOtpUseCase } from '../../application/ResendOtpUseCase';

export class CommonAuthController {
  constructor(
    private readonly studentLoginUC: LoginStudentUseCase,
    private readonly instructorLoginUC: LoginInstructorUseCase,
    private readonly accessTokenUseCase: AccessTokenUseCase,
    private readonly resendOtpUseCase: ResendOtpUseCase
  ) {}

   amILoggedIn = (req: Request, res: Response): void => {
    const user = req.user;
    res.status(200).json({message: 'User is logged in', user});
  }

   login = async(req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    // const { role } = req.query;
    let role = 'student'
    if (!email || !password || !role) {
      res
        .status(400)
        .json({ error: 'Email, password, and role are required' });
      return;
    }

    try {
      let data;

      switch (role) {
        case 'student':
          data = await this.studentLoginUC.execute(email, password);
          break;
        case 'instructor':
          data = await this.instructorLoginUC.execute(email, password);
          break;
        default:
          res.status(400).json({ message: 'Invalid role' });
          return;
      }
      const { user, accessToken, refreshToken } = data;

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        message: 'Login successful',
        user: {
          name: user.name,
          email: user.email,
          role,
          profilePicture: user.profilePictureUrl,
        },
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Invalid credentials' });
    }
  }

    refreshToken =  (req: Request, res: Response):void=>{
    
      const refreshToken = req.cookies.refresh_token;

      const newAccessToken = this.accessTokenUseCase.execute(refreshToken);

      res.cookie("access_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000 // 15 min
      });

       res.status(200).json({ message: "Access token refreshed" });
    
  };


    resendOtp = async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body
      console.log(email)
      await this.resendOtpUseCase.execute(email); 
      res.json({ message: "OTP resent successfully" });
    };


   logout=(req: Request, res: Response)=> {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Logout successful' });
  }

  
}
