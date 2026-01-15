import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { MentorshipSlot } from '../../domain/entities/MentorshipSlot';
import { IGetSlotsByJobTitleUseCase } from '../interfaces/ISlotUseCases';

/**
 * Use case for retrieving available slots by job title.
 */
export class GetSlotsByJobTitleUseCase implements IGetSlotsByJobTitleUseCase {
  constructor(private _slotRepo: IMentorshipSlotRepository) {}

  async execute(jobTitle: string): Promise<MentorshipSlot[]> {
    return await this._slotRepo.findByJobTitle(jobTitle);
  }
}
