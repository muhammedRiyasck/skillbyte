import { z } from 'zod';
import { UserRole } from '../../../../shared/enums/UserRole';

/**
 * Zod schema for validating forgot password data.
 */
export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum([UserRole.STUDENT, UserRole.INSTRUCTOR], {
    message: 'Role must be student or instructor',
  }),
});

export type ForgotPasswordValidationType = z.infer<typeof ForgotPasswordSchema>;
