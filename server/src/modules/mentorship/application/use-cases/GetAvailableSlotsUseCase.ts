import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { MentorshipSlot } from '../../domain/entities/MentorshipSlot';
import { SlotFiltersDto } from '../dtos/SlotDto';
import { IGetAvailableSlotsUseCase } from '../interfaces/ISlotUseCases';

/**
 * Use case for retrieving available slots with optional filters.
 */
export class GetAvailableSlotsUseCase implements IGetAvailableSlotsUseCase {
  constructor(private _slotRepo: IMentorshipSlotRepository) {}

  async execute(filters?: SlotFiltersDto): Promise<MentorshipSlot[]> {
    return await this._slotRepo.findAvailableSlots(filters);
  }
}
