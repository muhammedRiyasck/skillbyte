import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { SlotFiltersDto } from '../dtos/SlotDto';
import { SlotResponseDto } from '../dtos/SlotResponseDto';
import { SlotResponseMapper } from '../mappers/SlotResponseMapper';
import { IGetAvailableSlotsUseCase } from '../interfaces/ISlotUseCases';

/**
 * Use case for retrieving available slots with optional filters.
 */
export class GetAvailableSlotsUseCase implements IGetAvailableSlotsUseCase {
  constructor(private _slotRepo: IMentorshipSlotRepository) {}

  async execute(filters?: SlotFiltersDto): Promise<SlotResponseDto[]> {
    const slots = await this._slotRepo.findAvailableSlots(filters);
    return slots.map(SlotResponseMapper.toResponseDto);
  }
}
