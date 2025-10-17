import { z } from 'zod';

/**
 * Zod schema for validating Admin login data.
 */
export const LoginAdminSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Type inferred from the LoginAdminSchema.
 */
export type LoginAdminValidationType = z.infer<typeof LoginAdminSchema>;
