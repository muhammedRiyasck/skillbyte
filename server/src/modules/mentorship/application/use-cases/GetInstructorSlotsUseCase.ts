import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import {
  MentorshipSlot,
  SlotStatus,
} from '../../domain/entities/MentorshipSlot';
import { IGetInstructorSlotsUseCase } from '../interfaces/ISlotUseCases';

/**
 * Use case for retrieving all slots for a specific instructor.
 */
export class GetInstructorSlotsUseCase implements IGetInstructorSlotsUseCase {
  constructor(private _slotRepo: IMentorshipSlotRepository) {}

  async execute(
    instructorId: string,
    filters?: {
      status?: SlotStatus;
      fromDate?: Date;
      toDate?: Date;
      page?: number;
      limit?: number;
    },
  ): Promise<MentorshipSlot[]> {
    return await this._slotRepo.findByInstructorId(instructorId, filters);
  }
}
