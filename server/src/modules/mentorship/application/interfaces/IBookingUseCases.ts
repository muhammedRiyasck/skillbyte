import { MentorshipBooking } from '../../domain/entities/MentorshipBooking';
import { BookSlotDto, CancelBookingDto } from '../dtos/BookingDto';
import { PaymentInitiationResponse } from '../../../../shared/services/payment/interfaces/IPaymentProvider';

export interface IBookSlotUseCase {
  execute(dto: BookSlotDto): Promise<{
    booking: MentorshipBooking;
    providerResponse: PaymentInitiationResponse;
  }>;
}

export interface ICancelBookingUseCase {
  execute(dto: CancelBookingDto): Promise<void>;
}

export interface IGetStudentBookingsUseCase {
  execute(
    studentId: string,
    page?: number,
    limit?: number,
    status?: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<MentorshipBooking[]>;
}

export interface IGetInstructorBookingsUseCase {
  execute(
    instructorId: string,
    page?: number,
    limit?: number,
    status?: string,
  ): Promise<MentorshipBooking[]>;
}

export interface ICompleteSessionUseCase {
  execute(bookingId: string): Promise<void>;
}

export interface IGenerateVideoRoomUseCase {
  execute(bookingId: string): Promise<{ roomId: string; roomUrl: string }>;
}

export interface IValidateVideoRoomAccessUseCase {
  execute(
    roomId: string,
    userId: string,
    userRole: 'student' | 'instructor',
  ): Promise<{ bookingId: string; isValid: boolean }>;
}
