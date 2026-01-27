import { MentorshipController } from '../controllers/MentorshipController';
import { MentorshipSlotRepository } from '../../infrastructure/repositories/MentorshipSlotRepository';
import { CreateSlotUseCase } from '../../application/use-cases/CreateSlotUseCase';
import { GetInstructorSlotsUseCase } from '../../application/use-cases/GetInstructorSlotsUseCase';
import { UpdateSlotUseCase } from '../../application/use-cases/UpdateSlotUseCase';
import { DeleteSlotUseCase } from '../../application/use-cases/DeleteSlotUseCase';
import { GetSlotsByJobTitleUseCase } from '../../application/use-cases/GetSlotsByJobTitleUseCase';
import { GetAvailableSlotsUseCase } from '../../application/use-cases/GetAvailableSlotsUseCase';

import { GetUniqueTagsUseCase } from '../../application/use-cases/GetUniqueTagsUseCase';
import { MentorshipBookingRepository } from '../../infrastructure/repositories/MentorshipBookingRepository';
import { BookSlotUseCase } from '../../application/use-cases/BookSlotUseCase';
import { CancelBookingUseCase } from '../../application/use-cases/CancelBookingUseCase';
import { GetStudentBookingsUseCase } from '../../application/use-cases/GetStudentBookingsUseCase';
import { GetInstructorBookingsUseCase } from '../../application/use-cases/GetInstructorBookingsUseCase';
import { GenerateVideoRoomUseCase } from '../../application/use-cases/GenerateVideoRoomUseCase';
import { initiatePaymentUc } from '../../../payment/entry-point/PaymentContainer';

import { MentorshipFulfillmentService } from '../../application/services/MentorshipFulfillmentService';
import { MentorshipSocketService } from '../../infrastructure/services/MentorshipSocketService';

import { InstructorRepository } from '../../../instructor/infrastructure/repositories/InstructorRepository';
import { PaymentReadRepository } from '../../../payment/infrastructure/repositories/PaymentReadRepository';
import { PaymentWriteRepository } from '../../../payment/infrastructure/repositories/PaymentWriteRepository';
import { StripeProvider } from '../../../../shared/services/payment/StripeProvider';
import { PayPalProvider } from '../../../../shared/services/payment/PayPalProvider';

// Repositories
const slotRepository = new MentorshipSlotRepository();
const bookingRepository = new MentorshipBookingRepository();
const instructorRepository = new InstructorRepository();
const paymentReadRepository = new PaymentReadRepository();
const paymentWriteRepository = new PaymentWriteRepository();

// Providers
const stripeProvider = new StripeProvider();
const paypalProvider = new PayPalProvider();

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
const getUniqueTagsUC = new GetUniqueTagsUseCase(slotRepository);
const bookSlotUC = new BookSlotUseCase(
  slotRepository,
  bookingRepository,
  initiatePaymentUc,
);
export const cancelBookingUC = new CancelBookingUseCase(
  bookingRepository,
  slotRepository,
  paymentReadRepository,
  paymentWriteRepository,
  stripeProvider,
  paypalProvider,
);
export const getStudentBookingsUC = new GetStudentBookingsUseCase(
  bookingRepository,
);
export const getInstructorBookingsUC = new GetInstructorBookingsUseCase(
  bookingRepository,
);
const generateVideoRoomUC = new GenerateVideoRoomUseCase(bookingRepository);
export { bookingRepository, slotRepository };

// Controller
export const mentorshipController = new MentorshipController(
  createSlotUC,
  getInstructorSlotsUC,
  updateSlotUC,
  deleteSlotUC,
  getSlotsByJobTitleUC,
  getAvailableSlotsUC,
  getUniqueTagsUC,
  bookSlotUC,
  cancelBookingUC,
  getStudentBookingsUC,
  getInstructorBookingsUC,
  generateVideoRoomUC,
);
