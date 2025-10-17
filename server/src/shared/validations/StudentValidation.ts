import { z } from 'zod';

/**
 * Zod schema for validating Student data.
 */
export const StudentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  passwordHash: z.string().min(6, 'Password must be at least 6 characters'),
  isEmailVerified: z.boolean().optional(),
  registeredVia: z.enum(['google', 'local']).default('local'),
  profilePictureUrl: z.string().url().nullable().optional(),
  accountStatus: z.enum(['active', 'block']).default('active'),
  _id: z.string().optional(),
});

/**
 * Zod schema for validating Student registration data.
 */
export const StudentRegistrationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Types inferred from the schemas.
 */
export type StudentValidationType = z.infer<typeof StudentSchema>;
export type StudentRegistrationValidationType = z.infer<typeof StudentRegistrationSchema>;
