import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { IGetUniqueTagsUseCase } from '../interfaces/ISlotUseCases';

export class GetUniqueTagsUseCase implements IGetUniqueTagsUseCase {
  constructor(private _slotRepository: IMentorshipSlotRepository) {}

  async execute(): Promise<string[]> {
    const tags = await this._slotRepository.getUniqueTags();
    return tags.sort();
  }
}
