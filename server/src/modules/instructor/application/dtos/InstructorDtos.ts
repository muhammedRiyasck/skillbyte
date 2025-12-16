import { z } from 'zod';

export const InstructorRegistrationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  subject: z.string().min(1, "Subject is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  socialMediaLink: z.string().optional().or(z.literal('')),
  experience: z.string().or(z.number()).transform((val) => Number(val)), 
  portfolioLink: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
  customJobTitle: z.string().optional().or(z.literal('')),
  customSubject: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.subject.trim() === 'Other' && !data.customSubject) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Custom subject is required when subject is 'Other'",
      path: ["customSubject"],
    });
  }
  if (data.jobTitle.trim() === 'Other' && !data.customJobTitle) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Custom job title is required when job title is 'Other'",
      path: ["customJobTitle"],
    });
  }
});

export type InstructorRegistrationDto = z.infer<typeof InstructorRegistrationSchema>;

export const InstructorVerifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  Otp: z.string().min(4, "OTP must be valid"),
});

export type InstructorVerifyOtpDto = z.infer<typeof InstructorVerifyOtpSchema>;

export const InstructorReapplySchema = z.object({
    email: z.string().email(),
    // Allow other fields to be loosely typed as updates, or strictly typed if we want to enforce schema on updates
    // For now, allowing flexible updates but email is key
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

export type InstructorReapplyDto = z.infer<typeof InstructorReapplySchema>;

export const InstructorProfileUpdateSchema = z.object({
    fullName: z.string().optional(),
    phoneNumber: z.string().optional(),
    subject: z.string().optional(),
    jobTitle: z.string().optional(),
    socialMediaLink: z.string().optional(),
    experience: z.string().or(z.number()).optional(),
    portfolioLink: z.string().optional(),
    bio: z.string().optional(),
    // Add other profile fields if needed
});

export type InstructorProfileUpdateDto = z.infer<typeof InstructorProfileUpdateSchema>;
