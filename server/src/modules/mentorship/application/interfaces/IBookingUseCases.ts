import {
  BookSlotDto,
  CancelBookingDto,
  GetStudentBookingsDto,
  GetInstructorBookingsDto,
  ValidateVideoRoomAccessDto,
} from '../dtos/BookingDto';
import { BookingResponseDto } from '../dtos/BookingResponseDto';
import { PaymentInitiationResponse } from '../../../../shared/services/payment/interfaces/IPaymentProvider';

export interface IBookSlotUseCase {
  execute(dto: BookSlotDto): Promise<{
    booking: BookingResponseDto;
    providerResponse: PaymentInitiationResponse;
  }>;
}

export interface ICancelBookingUseCase {
  execute(dto: CancelBookingDto): Promise<void>;
}

export interface IGetStudentBookingsUseCase {
  execute(dto: GetStudentBookingsDto): Promise<BookingResponseDto[]>;
}

export interface IGetInstructorBookingsUseCase {
  execute(dto: GetInstructorBookingsDto): Promise<BookingResponseDto[]>;
}

export interface ICompleteSessionUseCase {
  execute(bookingId: string): Promise<void>;
}

export interface IGenerateVideoRoomUseCase {
  execute(bookingId: string): Promise<{ roomId: string; roomUrl: string }>;
}

export interface IValidateVideoRoomAccessUseCase {
  execute(
    dto: ValidateVideoRoomAccessDto,
  ): Promise<{ bookingId: string; isValid: boolean; status?: string }>;
}

export interface IAutoCompleteBookingsUseCase {
  execute(): Promise<void>;
}
