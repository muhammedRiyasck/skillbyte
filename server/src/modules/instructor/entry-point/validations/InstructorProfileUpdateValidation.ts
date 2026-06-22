import { z } from 'zod';

export const InstructorProfileUpdateSchema = z.object({
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  subject: z.string().optional(),
  jobTitle: z.string().optional(),
  socialProfile: z.string().optional(),
  experience: z.string().or(z.number()).optional(),
  portfolio: z.string().optional().nullable(),
  bio: z.string().optional(),
  profilePicture: z.string().optional().nullable(),
});
