
export type singInPayload = {
  email: string;
  password: string;
}

export interface signUpPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
}

export interface otpPayload{
  otp: string;
  email:string
}
