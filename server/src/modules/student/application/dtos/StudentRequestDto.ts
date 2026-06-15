export interface StudentRegistrationRequestDto {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface StudentVerifyOtpRequestDto {
  email: string;
  Otp: string;
}
