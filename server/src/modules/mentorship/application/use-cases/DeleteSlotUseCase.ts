import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { IDeleteSlotUseCase } from '../interfaces/ISlotUseCases';

/**
 * Use case for deleting a mentorship slot.
 */
export class DeleteSlotUseCase implements IDeleteSlotUseCase {
  constructor(private _slotRepo: IMentorshipSlotRepository) {}

  async execute(slotId: string): Promise<void> {
    // Check if slot exists
    const existingSlot = await this._slotRepo.findById(slotId);
    if (!existingSlot) {
      throw new Error('Slot not found');
    }

    // Cannot delete a booked slot
    if (existingSlot.status === 'booked') {
      throw new Error('Cannot delete a booked slot. Cancel the booking first.');
    }

    await this._slotRepo.deleteById(slotId);
  }
}
