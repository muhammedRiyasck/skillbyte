import { z } from 'zod';

/**
 * Zod schema for validating instructor registration data.
 */
export const InstructorRegistrationSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  subject: z.string().min(1, 'Subject is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  experience: z.number().min(0, 'Experience must be a positive number'),
  socialMediaLink: z.string().url('Invalid social media link').optional(),
  portfolio: z.string().url('Invalid portfolio URL').optional(),
  bio: z.string().min(1, 'Bio is required'),
  resumeFile: z.unknown(),
  profilePictureUrl: z.string().url('Invalid profile picture URL').optional(),
});

/**
 * Types inferred from the schemas.
 */
export type InstructorRegistrationValidationType = z.infer<
  typeof InstructorRegistrationSchema
>;
