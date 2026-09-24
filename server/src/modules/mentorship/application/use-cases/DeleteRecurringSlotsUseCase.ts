import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { IDeleteRecurringSlotsUseCase } from '../interfaces/ISlotUseCases';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/** Executes the business logic for delete recurring slots. */
export class DeleteRecurringSlotsUseCase
  implements IDeleteRecurringSlotsUseCase
{
  constructor(private _slotRepo: IMentorshipSlotRepository) {}

  /**
   * Execute for the DeleteRecurringSlots entity.
   *
   * @param recurrenceGroupId - The unique identifier for the recurrenceGroup.
   * @param instructorId - The unique identifier for the instructor.
   * @param onlyUpcoming - The only upcoming information.
   * @returns The result of the operation.
   */
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
