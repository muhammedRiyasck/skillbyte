import { z } from 'zod';

const urlOrEmpty = z
  .string()
  .optional()
  .nullable()
  .refine((val) => !val || /^https?:\/\/.+\..+/.test(val), {
    message: 'Must be a valid URL (starting with http:// or https://)',
  });

export const StudentProfileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes',
    )
    .optional(),

  headline: z
    .string()
    .max(120, 'Headline must be at most 120 characters')
    .optional()
    .nullable(),

  bio: z
    .string()
    .max(500, 'Bio must be at most 500 characters')
    .optional()
    .nullable(),

  phoneNumber: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^\+?[1-9]\d{6,14}$/.test(val.replace(/[\s\-().]/g, '')),
      {
        message:
          'Phone number must be a valid international phone number (e.g. +91 9876543210)',
      },
    ),

  timezone: z.string().optional().nullable(),

  location: z
    .string()
    .max(100, 'Location must be at most 100 characters')
    .optional()
    .nullable(),

  socialLinks: z
    .object({
      linkedin: urlOrEmpty,
      github: urlOrEmpty,
      website: urlOrEmpty,
      twitter: urlOrEmpty,
    })
    .optional(),

  interests: z
    .array(
      z
        .string()
        .min(1, 'Interest tag cannot be empty')
        .max(50, 'Each interest must be at most 50 characters'),
    )
    .max(20, 'You can add at most 20 interests')
    .optional(),

  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),

  learningGoals: z.array(z.string()).optional(),
});
