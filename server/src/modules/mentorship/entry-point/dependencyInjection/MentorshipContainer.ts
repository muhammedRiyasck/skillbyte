import { MentorshipController } from '../controllers/MentorshipController';
import { MentorshipSlotRepository } from '../../infrastructure/repositories/MentorshipSlotRepository';
import { CreateSlotUseCase } from '../../application/use-cases/CreateSlotUseCase';
import { GetInstructorSlotsUseCase } from '../../application/use-cases/GetInstructorSlotsUseCase';
import { UpdateSlotUseCase } from '../../application/use-cases/UpdateSlotUseCase';
import { DeleteSlotUseCase } from '../../application/use-cases/DeleteSlotUseCase';
import { GetSlotsByJobTitleUseCase } from '../../application/use-cases/GetSlotsByJobTitleUseCase';
import { GetAvailableSlotsUseCase } from '../../application/use-cases/GetAvailableSlotsUseCase';

import { MentorshipBookingRepository } from '../../infrastructure/repositories/MentorshipBookingRepository';
import { BookSlotUseCase } from '../../application/use-cases/BookSlotUseCase';
import { CancelBookingUseCase } from '../../application/use-cases/CancelBookingUseCase';
import { GetStudentBookingsUseCase } from '../../application/use-cases/GetStudentBookingsUseCase';
import { GetInstructorBookingsUseCase } from '../../application/use-cases/GetInstructorBookingsUseCase';
import { initiatePaymentUc } from '../../../payment/entry-point/PaymentContainer';

import { MentorshipFulfillmentService } from '../../application/services/MentorshipFulfillmentService';
import { MentorshipSocketService } from '../../infrastructure/services/MentorshipSocketService';

import { InstructorRepository } from '../../../instructor/infrastructure/repositories/InstructorRepository';

// Repositories
const slotRepository = new MentorshipSlotRepository();
const bookingRepository = new MentorshipBookingRepository();
const instructorRepository = new InstructorRepository();

// Services (Side-effects on instantiation)
new MentorshipFulfillmentService(bookingRepository);
new MentorshipSocketService();

// Use Cases
const createSlotUC = new CreateSlotUseCase(
  slotRepository,
  instructorRepository,
);
const getInstructorSlotsUC = new GetInstructorSlotsUseCase(slotRepository);
const updateSlotUC = new UpdateSlotUseCase(slotRepository);
const deleteSlotUC = new DeleteSlotUseCase(slotRepository);
const getSlotsByJobTitleUC = new GetSlotsByJobTitleUseCase(slotRepository);
const getAvailableSlotsUC = new GetAvailableSlotsUseCase(slotRepository);
const bookSlotUC = new BookSlotUseCase(
  slotRepository,
  bookingRepository,
  initiatePaymentUc,
);
const cancelBookingUC = new CancelBookingUseCase(
  bookingRepository,
  slotRepository,
);
const getStudentBookingsUC = new GetStudentBookingsUseCase(bookingRepository);
const getInstructorBookingsUC = new GetInstructorBookingsUseCase(
  bookingRepository,
);

// Controller
export const mentorshipController = new MentorshipController(
  createSlotUC,
  getInstructorSlotsUC,
  updateSlotUC,
  deleteSlotUC,
  getSlotsByJobTitleUC,
  getAvailableSlotsUC,
  bookSlotUC,
  cancelBookingUC,
  getStudentBookingsUC,
  getInstructorBookingsUC,
);
