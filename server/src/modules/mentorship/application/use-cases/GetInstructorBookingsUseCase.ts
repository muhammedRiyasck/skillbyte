import { IGetInstructorBookingsUseCase } from '../interfaces/IBookingUseCases';
import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import { MentorshipBooking } from '../../domain/entities/MentorshipBooking';

export class GetInstructorBookingsUseCase
  implements IGetInstructorBookingsUseCase
{
  constructor(private bookingRepo: IMentorshipBookingRepository) {}

  async execute(instructorId: string): Promise<MentorshipBooking[]> {
    return this.bookingRepo.findByInstructorId(instructorId);
  }
}
