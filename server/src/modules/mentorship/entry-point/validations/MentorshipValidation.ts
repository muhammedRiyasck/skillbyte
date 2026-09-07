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
  currency: z.string().min(3).max(3).optional(),
  scheduledAt: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Scheduled date must be in the future',
  }),
  jobTitle: z.string().min(2).optional(),
  tags: z.array(z.string()).optional(),
  timezone: z.string().optional(),
});

export const createRecurringSlotSchema = z.object({
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
  currency: z.string().min(3).max(3).optional(),
  jobTitle: z.string().min(2).optional(),
  tags: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  timezoneOffset: z.number().optional(),
  recurrence: z
    .object({
      frequency: z.enum(['daily', 'weekly']),
      daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      time: z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:mm format'),
    })
    .refine((data) => data.endDate >= data.startDate, {
      message: 'End date must be greater than or equal to start date',
      path: ['endDate'],
    })
    .refine(
      (data) => {
        if (data.frequency === 'weekly') {
          return Array.isArray(data.daysOfWeek) && data.daysOfWeek.length > 0;
        }
        return true;
      },
      {
        message:
          'At least one day of the week must be selected for weekly recurring slots',
        path: ['daysOfWeek'],
      },
    ),
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
  providerName: z.preprocess(
    (val) => (typeof val === 'string' ? val.toLowerCase() : val),
    z.enum(['stripe', 'paypal', 'razorpay', 'free']).optional(),
  ),
});

export const rescheduleBookingSchema = z.object({
  newScheduledAt: z.coerce.date().refine((date) => date > new Date(), {
    message: 'New scheduled date must be in the future',
  }),
  reason: z.string().max(500).optional(),
});
