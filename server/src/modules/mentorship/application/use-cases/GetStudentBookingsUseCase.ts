import { IGetStudentBookingsUseCase } from '../interfaces/IBookingUseCases';
import { GetStudentBookingsDto } from '../dtos/BookingDto';
import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import { BookingStatus } from '../../domain/entities/MentorshipBooking';
import { BookingResponseDto } from '../dtos/BookingResponseDto';
import { BookingResponseMapper } from '../mappers/BookingResponseMapper';

/** Executes the business logic for get student bookings. */
export class GetStudentBookingsUseCase implements IGetStudentBookingsUseCase {
  constructor(private bookingRepo: IMentorshipBookingRepository) {}

  /**
   * Execute for the GetStudentBookings entity.
   *
   * @param dto - The data transfer object containing request details.
   * @returns The standardized HTTP response.
   */
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
