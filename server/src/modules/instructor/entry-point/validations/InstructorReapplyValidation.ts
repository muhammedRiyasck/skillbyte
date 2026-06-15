import { z } from 'zod';

export const InstructorReapplySchema = z.object({
  email: z.string().email(),
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  subject: z.string().optional(),
  jobTitle: z.string().optional(),
  socialMediaLink: z.string().optional(),
  experience: z.string().or(z.number()).optional(),
  portfolioLink: z.string().optional(),
  bio: z.string().optional(),
  customJobTitle: z.string().optional(),
  customSubject: z.string().optional(),
});

export type InstructorReapplyValidationType = z.infer<
  typeof InstructorReapplySchema
>;
