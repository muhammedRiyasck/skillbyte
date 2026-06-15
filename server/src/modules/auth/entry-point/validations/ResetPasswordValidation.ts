import { z } from 'zod';
import { UserRole } from '../../../../shared/enums/UserRole';

/**
 * Zod schema for validating reset password data.
 */
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
  role: z.enum([UserRole.STUDENT, UserRole.INSTRUCTOR], {
    message: 'Role must be student or instructor',
  }),
});

export type ResetPasswordValidationType = z.infer<typeof ResetPasswordSchema>;
