import { z } from 'zod';

export const InstructorRegistrationSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    subject: z.string().min(1, 'Subject is required'),
    jobTitle: z.string().min(1, 'Job title is required'),
    socialMediaLink: z.string().optional().or(z.literal('')),
    experience: z
      .string()
      .or(z.number())
      .transform((val) => Number(val)),
    portfolioLink: z.string().optional().or(z.literal('')),
    bio: z.string().optional().or(z.literal('')),
    customJobTitle: z.string().optional().or(z.literal('')),
    customSubject: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.subject.trim() === 'Other' && !data.customSubject) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom subject is required when subject is 'Other'",
        path: ['customSubject'],
      });
    }
    if (data.jobTitle.trim() === 'Other' && !data.customJobTitle) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom job title is required when job title is 'Other'",
        path: ['customJobTitle'],
      });
    }
  });
