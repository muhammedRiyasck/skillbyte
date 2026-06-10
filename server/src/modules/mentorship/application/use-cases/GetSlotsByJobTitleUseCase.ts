import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { IGetSlotsByJobTitleUseCase } from '../interfaces/ISlotUseCases';
import { SlotResponseDto } from '../dtos/SlotResponseDto';
import { SlotResponseMapper } from '../mappers/SlotResponseMapper';

/**
 * Use case for retrieving available slots by job title.
 */
export class GetSlotsByJobTitleUseCase implements IGetSlotsByJobTitleUseCase {
  constructor(private _slotRepo: IMentorshipSlotRepository) {}

  async execute(jobTitle: string): Promise<SlotResponseDto[]> {
    const slots = await this._slotRepo.findByJobTitle(jobTitle);
    return slots.map(SlotResponseMapper.toResponseDto);
  }
}
