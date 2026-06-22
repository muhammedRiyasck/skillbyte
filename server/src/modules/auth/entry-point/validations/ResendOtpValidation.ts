import { z } from 'zod';

/**
 * Zod schema for validating resend OTP data.
 */
export const ResendOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
});
