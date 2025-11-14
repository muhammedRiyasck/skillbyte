import { z } from 'zod';

/**
 * Zod schema for validating login data.
 */
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['student', 'instructor'], { message: 'Role must be student or instructor' }),
});

/**
 * Zod schema for validating resend OTP data.
 */
export const ResendOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
});

/**
 * Zod schema for validating forgot password data.
 */
export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['student', 'instructor'], { message: 'Role must be student or instructor' }),
});

/**
 * Zod schema for validating reset password data.
 */
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'instructor'], { message: 'Role must be student or instructor' }),
});

/**
 * Zod schema for validating instructor registration data.
 */
export const InstructorRegistrationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  subject: z.string().min(1, 'Subject is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  experience: z.number().min(0, 'Experience must be a positive number'),
  socialMediaLink: z.string().url('Invalid social media link').optional(),
  portfolio: z.string().url('Invalid portfolio URL').optional(),
  bio: z.string().min(1, 'Bio is required'),
  resumeFile: z.any(),
  profilePictureUrl: z.string().url('Invalid profile picture URL').optional(),
});

/**
 * Types inferred from the schemas.
 */
export type LoginValidationType = z.infer<typeof LoginSchema>;
export type ResendOtpValidationType = z.infer<typeof ResendOtpSchema>;
export type ForgotPasswordValidationType = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordValidationType = z.infer<typeof ResetPasswordSchema>;
export type InstructorRegistrationValidationType = z.infer<typeof InstructorRegistrationSchema>;
