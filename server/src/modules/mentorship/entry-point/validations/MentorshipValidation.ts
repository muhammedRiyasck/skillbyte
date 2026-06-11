import { z } from 'zod';

export const createSlotSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(100),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(1000),
  duration: z.union([
    z.literal(30),
    z.literal(45),
    z.literal(60),
    z.literal(90),
  ]),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  currency: z.string().min(3).max(3),
  scheduledAt: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Scheduled date must be in the future',
  }),
  jobTitle: z.string().min(2),
  tags: z.array(z.string()).optional(),
  timezone: z.string().optional(),
});

export const updateSlotSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  duration: z
    .union([z.literal(30), z.literal(45), z.literal(60), z.literal(90)])
    .optional(),
  price: z.number().min(0).optional(),
  currency: z.string().min(3).max(3).optional(),
  scheduledAt: z.coerce
    .date()
    .refine((date) => date > new Date(), {
      message: 'Scheduled date must be in the future',
    })
    .optional(),
  jobTitle: z.string().min(2).optional(),
  tags: z.array(z.string()).optional(),
  timezone: z.string().optional(),
});

export const bookSlotSchema = z.object({
  slotId: z.string().min(1, 'Slot ID is required'),
  providerName: z.enum(['stripe', 'paypal', 'razorpay']),
});
