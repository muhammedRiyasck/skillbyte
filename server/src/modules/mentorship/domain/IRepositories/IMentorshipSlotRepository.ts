import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import { MentorshipSlot, SlotStatus } from '../entities/MentorshipSlot';

export interface IMentorshipSlotRepository
  extends IBaseRepository<MentorshipSlot> {
  findByInstructorId(instructorId: string): Promise<MentorshipSlot[]>;

  findAvailableSlots(filters?: {
    jobTitle?: string;
    minPrice?: number;
    maxPrice?: number;
    fromDate?: Date;
    toDate?: Date;
    tags?: string[];
  }): Promise<MentorshipSlot[]>;

  findByJobTitle(jobTitle: string): Promise<MentorshipSlot[]>;

  updateStatus(slotId: string, status: SlotStatus): Promise<void>;

  incrementBookings(slotId: string): Promise<void>;

  decrementBookings(slotId: string): Promise<void>;

  findUpcomingSlots(instructorId: string): Promise<MentorshipSlot[]>;
}
