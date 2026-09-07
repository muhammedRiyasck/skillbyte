import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { IDeleteRecurringSlotsUseCase } from '../interfaces/ISlotUseCases';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class DeleteRecurringSlotsUseCase
  implements IDeleteRecurringSlotsUseCase
{
  constructor(private _slotRepo: IMentorshipSlotRepository) {}

  async execute(
    recurrenceGroupId: string,
    instructorId: string,
    onlyUpcoming: boolean = true,
  ): Promise<{ deletedCount: number }> {
    if (!recurrenceGroupId) {
      throw new HttpError(
        'Recurrence group ID is required',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const result = await this._slotRepo.deleteByRecurrenceGroupId(
      recurrenceGroupId,
      instructorId,
      onlyUpcoming,
    );

    return result;
  }
}
