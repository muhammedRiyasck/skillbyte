
export interface IsingInPayload  {
  email: string;
  password: string;
}

export interface IsignUpPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
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
