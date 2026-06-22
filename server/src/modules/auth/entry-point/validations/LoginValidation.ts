import { z } from 'zod';
import { UserRole } from '../../../../shared/enums/UserRole';

/**
 * Zod schema for validating login data.
 */
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum([UserRole.STUDENT, UserRole.INSTRUCTOR], {
    message: 'Role must be student or instructor',
  }),
});
