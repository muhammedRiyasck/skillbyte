import { Router } from 'express';
import { mentorshipController } from '../dependencyInjection/MentorshipContainer';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import asyncHandler from '../../../../shared/utils/AsyncHandler';

const router = Router();

// ==================== Instructor Routes ====================

// Create a new mentorship slot
router.post(
  '/slots',
  authenticate,
  requireRole('instructor'),
  asyncHandler(mentorshipController.createSlot),
);

// Get all slots for the authenticated instructor
router.get(
  '/slots/instructor',
  authenticate,
  requireRole('instructor'),
  asyncHandler(mentorshipController.getInstructorSlots),
);

// Update a mentorship slot
router.put(
  '/slots/:slotId',
  authenticate,
  requireRole('instructor'),
  asyncHandler(mentorshipController.updateSlot),
);

// Delete a mentorship slot
router.delete(
  '/slots/:slotId',
  authenticate,
  requireRole('instructor'),
  asyncHandler(mentorshipController.deleteSlot),
);

// ==================== Student Routes ====================

// Get all available slots (with optional filters)
router.get(
  '/slots',
  authenticate,
  requireRole('student'),
  asyncHandler(mentorshipController.getAvailableSlots),
);

// Get available slots by job title
router.get(
  '/slots/job-title/:jobTitle',
  authenticate,
  requireRole('student'),
  asyncHandler(mentorshipController.getSlotsByJobTitle),
);

// Book a mentorship slot
router.post(
  '/book',
  authenticate,
  requireRole('student'),
  asyncHandler(mentorshipController.bookSlot),
);

router.post(
  '/bookings/:bookingId/cancel',
  authenticate,
  asyncHandler(mentorshipController.cancelBooking),
);

// Get Student Bookings
router.get(
  '/bookings/student',
  authenticate,
  requireRole('student'),
  asyncHandler(mentorshipController.getStudentBookings),
);

// Get Instructor Bookings
router.get(
  '/bookings/instructor',
  authenticate,
  requireRole('instructor'),
  asyncHandler(mentorshipController.getInstructorBookings),
);

export default router;
