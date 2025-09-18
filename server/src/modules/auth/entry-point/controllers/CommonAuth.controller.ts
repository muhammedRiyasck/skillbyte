// modules/auth/interfaces/controllers/login.controller.ts

import { Request, Response } from 'express';
import { LoginStudentUseCase } from '../../../student/application/use-cases/LoginStudentUseCase';
import { LoginInstructorUseCase } from '../../../instructor/application/use-cases/LoginInstructorUseCase';
import { AccessTokenUseCase   } from '../../application/AccessTokenUseCase';
import { ResendOtpUseCase } from '../../application/ResendOtpUseCase';
import { ForgotPasswordUseCase } from '../../application/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '../../application/ResetPasswordUseCase';
import { AmILoggedInUseCase } from '../../application/AmILoggedInUseCase';

export class CommonAuthController {
  constructor(
    private readonly studentLoginUC: LoginStudentUseCase,
    private readonly instructorLoginUC: LoginInstructorUseCase,
    private readonly accessTokenUseCase: AccessTokenUseCase,
    private readonly resendOtpUseCase: ResendOtpUseCase,
    private readonly forgotPasswordUseCase : ForgotPasswordUseCase,
    private readonly resetPasswordUseCase : ResetPasswordUseCase,
    private readonly googleLoginUseCase : AmILoggedInUseCase
  ) {}

   amILoggedIn =  async(req: any, res: Response): Promise<void> => {
     const decodedUserData = req.user;
     const user = await this.googleLoginUseCase.execute(decodedUserData.id,decodedUserData.role)
     console.log('Iam i logged' , user?true:false)
    res.status(200).json({message: 'User is logged in', userData:{name:user?.name,email:user?.email,profilePicture:user?.profilePictureUrl,role:decodedUserData.role}});
  }

   login = async(req: Request, res: Response): Promise<void> => {
    const { email, password, role } = req.body;
    console.log(req.body,'from login')
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
        userData: {
          name: user.name,
          email: user.email,
          role,
          profilePicture: user.profilePictureUrl
        },
      });
    } catch (error: any) {
      res.status(error.status||400).json({ error: error.message || 'Invalid credentials' });
    }
  }

    refreshToken =  (req: Request, res: Response):void=>{
    
      const refreshToken = req.cookies.refresh_token;
      console.log('refresh token called ')
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
      await this.resendOtpUseCase.execute(email); 
      res.json({ message: "OTP resent successfully" });
    };

    forgotPassword = async (req:Request,res:Response): Promise<void> =>{
      const {email,role} = req.body
      const genericMsg = { message: 'If the email exists, a reset link has been sent.' };
      if(!['student','instructor'].includes(role)){
        res.status(400).json({message:'Invalid Role, Please Check It Properly'})
      }
      if(!email&&!role) {
        res.status(400).json({message:'Email and User Role is Required'})
        return
      }
      const user = await this.forgotPasswordUseCase.execute(email,role)
      if(user === false){
        console.log(true)
        await new Promise((res) => setTimeout(res, 5000));
      }
      res.status(200).json(genericMsg) 

    }

    resetPassword = async(req:Request,res:Response): Promise<void> =>{
      const {token , password, role} = req.body
      
       if(!['student','instructor'].includes(role)){
        res.status(400).json({message:'Invalid Role, Please Check It Properly'})
      }
      if(!password){
        res.status(400).json({message:'Reset Password is Required'}) 
        return
      }
      if(!role&&!token){
        res.status(400).json({message:'Token and Role is Required'}) 
        return
      }
      await this.resetPasswordUseCase.execute(token,password,role)
      res.status(200).json({message:'Password Reseted Successfully'})
    }


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

    res.status(200).json({ message: 'Logout successfull' });
  }

  
}
