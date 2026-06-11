import { z } from 'zod';

export const InitiatePaymentSchema = z
  .object({
    courseId: z.string().optional(),
    mentorshipBookingId: z.string().optional(),
    providerName: z.enum(['stripe', 'paypal']),
  })
  .refine((data) => data.courseId || data.mentorshipBookingId, {
    message: 'Either courseId or mentorshipBookingId must be provided',
  });

export const CapturePayPalPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});

export const RequestWithdrawalSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  payoutMethod: z.literal('STRIPE'),
});

export const ProcessWithdrawalSchema = z.object({
  adminNotes: z.string().optional(),
});

export const RejectWithdrawalSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});
