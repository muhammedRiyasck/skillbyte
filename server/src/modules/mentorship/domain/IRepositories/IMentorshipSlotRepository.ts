import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import { MentorshipSlot, SlotStatus } from '../entities/MentorshipSlot';

export interface IMentorshipSlotRepository
  extends IBaseRepository<MentorshipSlot> {
  findByInstructorId(
    instructorId: string,
    filters?: {
      status?: SlotStatus;
      fromDate?: Date;
      toDate?: Date;
      page?: number;
      limit?: number;
    },
  ): Promise<MentorshipSlot[]>;

  findAvailableSlots(filters?: {
    jobTitle?: string;
    minPrice?: number;
    maxPrice?: number;
    fromDate?: Date;
    toDate?: Date;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<MentorshipSlot[]>;

  findByJobTitle(jobTitle: string): Promise<MentorshipSlot[]>;

  updateStatus(slotId: string, status: SlotStatus): Promise<void>;

  incrementBookings(slotId: string): Promise<void>;

  decrementBookings(slotId: string): Promise<void>;

  getUniqueTags(): Promise<string[]>;

  findUpcomingSlots(instructorId: string): Promise<MentorshipSlot[]>;

  hasOverlappingSlot(
    instructorId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<boolean>;
}
