import { z } from 'zod';

export const InstructorVerifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  Otp: z.string().min(4, 'OTP must be valid'),
});

export type InstructorVerifyOtpValidationType = z.infer<
  typeof InstructorVerifyOtpSchema
>;
