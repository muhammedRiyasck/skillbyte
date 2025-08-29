import { LoginAdminUseCase } from '../../application/use-cases/LoginAdminUseCase';
import { Request, Response } from 'express';
// import LoginAdminDTO from '../../application/dtos/LoginAdminDTO ';
export class AdminAuthContainer {
  constructor(private readonly loginAdminUseCase: LoginAdminUseCase) {}
   login = async(req: Request, res: Response): Promise<void> =>{
    const { email, password } = req.body;
    if (!email || !password) {
      res
        .status(400)
        .json({ message: 'Email, password, and role are required' });
      return;
    }
    let data = await this.loginAdminUseCase.execute({ email, password });
    const {  admin ,accessToken, refreshToken} = data;
    
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
      message: 'Admin Login Successful',
      userData: {
        name: admin.name,
        email: admin.email,
        role: 'admin',
        profilePicture: admin.profilePictureUrl,
      },
    });
  }
}
