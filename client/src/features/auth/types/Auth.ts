
export interface IsingInPayload  {
  email: string;
  password: string;
  role:string
}

export interface IStudentSignUpPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
}

export interface IinstrctorSignUpPayload{
  fullName:string;
  email:string;
  password:string;
  confirmPassword:string;
  subject:string;
  jobTitle:string;
  experience:string;
  socialMediaLink:string;
  portfolioLink?:string
}

export interface IotpPayload{
  Otp: string;
  email:string
}

export interface IforgotPassword {
  email:string
  role:string
}

export interface IresetPassword {
  role:string
  token:string
  password:string
}
