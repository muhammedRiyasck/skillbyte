import { IGetStudentBookingsUseCase } from '../interfaces/IBookingUseCases';
import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import { BookingStatus, MentorshipBooking } from '../../domain/entities/MentorshipBooking';

export class GetStudentBookingsUseCase implements IGetStudentBookingsUseCase {
  constructor(private bookingRepo: IMentorshipBookingRepository) {}

  async execute(
    studentId: string,
    page: number = 1,
    limit: number = 10,
    status?: BookingStatus,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<MentorshipBooking[]> {
    return this.bookingRepo.findByStudentId(
      studentId,
      page,
      limit,
      status ,
      fromDate,
      toDate,
    );
  }
}
