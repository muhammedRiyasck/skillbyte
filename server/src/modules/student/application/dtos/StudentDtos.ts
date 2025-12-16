import { z } from 'zod';

export const StudentRegistrationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type StudentRegistrationDto = z.infer<typeof StudentRegistrationSchema>;

export const StudentVerifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  Otp: z.string().min(4, 'OTP must be valid'),
});

export type StudentVerifyOtpDto = z.infer<typeof StudentVerifyOtpSchema>;
