import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { IDeleteSlotUseCase } from '../interfaces/ISlotUseCases';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { SlotStatus } from '../../domain/entities/MentorshipSlot';

/**
 * Use case for deleting a mentorship slot.
 */
export class DeleteSlotUseCase implements IDeleteSlotUseCase {
  constructor(private _slotRepo: IMentorshipSlotRepository) {}

  async execute(slotId: string): Promise<void> {
    // Check if slot exists
    const existingSlot = await this._slotRepo.findById(slotId);
    if (!existingSlot) {
      throw new HttpError('Slot not found', HttpStatusCode.NOT_FOUND);
    }

    // Cannot delete a booked slot
    if (existingSlot.status === SlotStatus.BOOKED) {
      throw new HttpError(
        'Cannot delete a booked slot. Cancel the booking first.',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    await this._slotRepo.deleteById(slotId);
  }
}
