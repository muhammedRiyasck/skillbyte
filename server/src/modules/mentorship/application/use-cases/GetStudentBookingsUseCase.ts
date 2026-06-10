import { IGetStudentBookingsUseCase } from '../interfaces/IBookingUseCases';
import { GetStudentBookingsDto } from '../dtos/BookingDto';
import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import {
  BookingStatus,
  MentorshipBooking,
} from '../../domain/entities/MentorshipBooking';
import { BookingResponseDto } from '../dtos/BookingResponseDto';
import { BookingResponseMapper } from '../mappers/BookingResponseMapper';

export class GetStudentBookingsUseCase implements IGetStudentBookingsUseCase {
  constructor(private bookingRepo: IMentorshipBookingRepository) {}

  async execute(dto: GetStudentBookingsDto): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingRepo.findByStudentId(
      dto.studentId,
      dto.page,
      dto.limit,
      dto.status as BookingStatus,
      dto.fromDate,
      dto.toDate,
    );
    return bookings.map(BookingResponseMapper.toResponseDto);
  }
}
