import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { IGetUniqueTagsUseCase } from '../interfaces/ISlotUseCases';

/** Executes the business logic for get unique tags. */
export class GetUniqueTagsUseCase implements IGetUniqueTagsUseCase {
  constructor(private _slotRepository: IMentorshipSlotRepository) {}

  /**
   * Execute for the GetUniqueTags entity.
   *
   * @returns The result of the operation.
   */
  async execute(): Promise<string[]> {
    const tags = await this._slotRepository.getUniqueTags();
    return tags.sort();
  }
}
