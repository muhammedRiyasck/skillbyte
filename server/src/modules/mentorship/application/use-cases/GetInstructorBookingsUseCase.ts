import { IGetInstructorBookingsUseCase } from '../interfaces/IBookingUseCases';
import { GetInstructorBookingsDto } from '../dtos/BookingDto';
import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import { BookingStatus } from '../../domain/entities/MentorshipBooking';
import { BookingResponseDto } from '../dtos/BookingResponseDto';
import { BookingResponseMapper } from '../mappers/BookingResponseMapper';

export class GetInstructorBookingsUseCase
  implements IGetInstructorBookingsUseCase
{
  constructor(private bookingRepo: IMentorshipBookingRepository) {}

  async execute(dto: GetInstructorBookingsDto): Promise<BookingResponseDto[]> {
    const bookings = dto.upcoming
      ? await this.bookingRepo.findUpcomingByInstructorId(dto.instructorId)
      : await this.bookingRepo.findByInstructorId(
          dto.instructorId,
          dto.page,
          dto.limit,
          dto.status as BookingStatus,
        );
    return bookings.map(BookingResponseMapper.toResponseDto);
  }
}
