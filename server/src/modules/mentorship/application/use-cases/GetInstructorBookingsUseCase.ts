import { IGetInstructorBookingsUseCase } from '../interfaces/IBookingUseCases';
import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import {
  BookingStatus,
  MentorshipBooking,
} from '../../domain/entities/MentorshipBooking';

export class GetInstructorBookingsUseCase
  implements IGetInstructorBookingsUseCase
{
  constructor(private bookingRepo: IMentorshipBookingRepository) {}

  async execute(
    instructorId: string,
    page: number = 1,
    limit: number = 10,
    status?: BookingStatus,
  ): Promise<MentorshipBooking[]> {
    return this.bookingRepo.findByInstructorId(
      instructorId,
      page,
      limit,
      status,
    );
  }
}
