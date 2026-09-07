import { Router } from 'express';
import {
  mentorshipSlotController,
  mentorshipBookingController,
  mentorshipVideoController,
} from '../dependencyInjection/MentorshipContainer';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import { validateRequest } from '../../../../shared/middlewares/validateRequest';
import asyncHandler from '../../../../shared/utils/AsyncHandler';
import {
  createSlotSchema,
  createRecurringSlotSchema,
  updateSlotSchema,
  bookSlotSchema,
  rescheduleBookingSchema,
} from '../validations/MentorshipValidation';

const router = Router();

// ==================== Instructor Slot Routes ====================

// Create a new mentorship slot
router.post(
  '/slots',
  authenticate,
  requireRole('instructor'),
  validateRequest(createSlotSchema),
  asyncHandler(mentorshipSlotController.createSlot),
);

// Create recurring mentorship slots
router.post(
  '/slots/recurring',
  authenticate,
  requireRole('instructor'),
  validateRequest(createRecurringSlotSchema),
  asyncHandler(mentorshipSlotController.createRecurringSlots),
);

// Delete recurring mentorship slots by recurrence group ID
router.delete(
  '/slots/recurring/:recurrenceGroupId',
  authenticate,
  requireRole('instructor'),
  asyncHandler(mentorshipSlotController.deleteRecurringSlots),
);

// Get all slots for the authenticated instructor
router.get(
  '/slots/instructor',
  authenticate,
  requireRole('instructor'),
  asyncHandler(mentorshipSlotController.getInstructorSlots),
);

// Update a mentorship slot
router.put(
  '/slots/:slotId',
  authenticate,
  requireRole('instructor'),
  validateRequest(updateSlotSchema),
  asyncHandler(mentorshipSlotController.updateSlot),
);

// Delete a mentorship slot
router.delete(
  '/slots/:slotId',
  authenticate,
  requireRole('instructor'),
  asyncHandler(mentorshipSlotController.deleteSlot),
);

// ==================== Student Slot Routes ====================

// Get available slots with optional filters
router.get(
  '/slots/tags',
  authenticate,
  requireRole('student'),
  asyncHandler(mentorshipSlotController.getUniqueTags),
);

// Get all available slots (with optional filters)
router.get(
  '/slots',
  authenticate,
  requireRole('student'),
  asyncHandler(mentorshipSlotController.getAvailableSlots),
);

// Get available slots by job title
router.get(
  '/slots/job-title/:jobTitle',
  authenticate,
  requireRole('student'),
  asyncHandler(mentorshipSlotController.getSlotsByJobTitle),
);

// ==================== Booking Routes ====================

// Book a mentorship slot
router.post(
  '/book',
  authenticate,
  requireRole('student'),
  validateRequest(bookSlotSchema),
  asyncHandler(mentorshipBookingController.bookSlot),
);

router.post(
  '/bookings/:bookingId/cancel',
  authenticate,
  asyncHandler(mentorshipBookingController.cancelBooking),
);

// Get Student Bookings
router.get(
  '/bookings/student',
  authenticate,
  requireRole('student'),
  asyncHandler(mentorshipBookingController.getStudentBookings),
);

// Get Instructor Bookings
router.get(
  '/bookings/instructor',
  authenticate,
  requireRole('instructor'),
  asyncHandler(mentorshipBookingController.getInstructorBookings),
);

// Reschedule a booking (instructor only)
router.patch(
  '/bookings/:bookingId/reschedule',
  authenticate,
  requireRole('instructor'),
  validateRequest(rescheduleBookingSchema),
  asyncHandler(mentorshipBookingController.rescheduleBooking),
);

// Resume a pending payment (re-fetch client_secret for Stripe checkout)
router.get(
  '/bookings/:bookingId/resume-payment',
  authenticate,
  requireRole('student'),
  asyncHandler(mentorshipBookingController.getResumePayment),
);

// ==================== Video Room Routes ====================

// Generate/Get Video Room
router.get(
  '/bookings/:bookingId/video-room',
  authenticate,
  asyncHandler(mentorshipVideoController.generateVideoRoom),
);

// Validate Video Room Access
router.post(
  '/video-room/:roomId/validate',
  authenticate,
  asyncHandler(mentorshipVideoController.validateVideoRoomAccess),
);

export default router;
