import { IGetInstructorBookingsUseCase } from '../interfaces/IBookingUseCases';
import { GetInstructorBookingsDto } from '../dtos/BookingDto';
import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import { BookingStatus } from '../../domain/entities/MentorshipBooking';
import { BookingResponseDto } from '../dtos/BookingResponseDto';
import { BookingResponseMapper } from '../mappers/BookingResponseMapper';

/** Executes the business logic for get instructor bookings. */
export class GetInstructorBookingsUseCase
  implements IGetInstructorBookingsUseCase
{
  constructor(private bookingRepo: IMentorshipBookingRepository) {}

  /**
   * Execute for the GetInstructorBookings entity.
   *
   * @param dto - The data transfer object containing request details.
   * @returns The standardized HTTP response.
   */
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
