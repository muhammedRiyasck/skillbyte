import { z } from 'zod';

export const LoginAdminSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginAdminValidationType = z.infer<typeof LoginAdminSchema>;
