import { IGetStudentBookingsUseCase } from '../interfaces/IBookingUseCases';
import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import { MentorshipBooking } from '../../domain/entities/MentorshipBooking';

export class GetStudentBookingsUseCase implements IGetStudentBookingsUseCase {
  constructor(private bookingRepo: IMentorshipBookingRepository) {}

  async execute(studentId: string): Promise<MentorshipBooking[]> {
    return this.bookingRepo.findByStudentId(studentId);
  }
}
