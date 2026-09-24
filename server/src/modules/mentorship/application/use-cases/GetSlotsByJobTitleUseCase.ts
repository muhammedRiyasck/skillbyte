import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { IGetSlotsByJobTitleUseCase } from '../interfaces/ISlotUseCases';
import { SlotResponseDto } from '../dtos/SlotResponseDto';
import { SlotResponseMapper } from '../mappers/SlotResponseMapper';

/** Executes the business logic for get slots by job title. */
export class GetSlotsByJobTitleUseCase implements IGetSlotsByJobTitleUseCase {
  constructor(private _slotRepo: IMentorshipSlotRepository) {}

  /**
   * Execute for the GetSlotsByJobTitle entity.
   *
   * @param jobTitle - The job title information.
   * @returns The standardized HTTP response.
   */
  async execute(jobTitle: string): Promise<SlotResponseDto[]> {
    const slots = await this._slotRepo.findByJobTitle(jobTitle);
    return slots.map(SlotResponseMapper.toResponseDto);
  }
}
