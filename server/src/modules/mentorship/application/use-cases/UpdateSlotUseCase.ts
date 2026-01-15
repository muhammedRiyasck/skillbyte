import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { MentorshipSlot } from '../../domain/entities/MentorshipSlot';
import { UpdateSlotDto } from '../dtos/SlotDto';
import { IUpdateSlotUseCase } from '../interfaces/ISlotUseCases';

/**
 * Use case for updating an existing mentorship slot.
 */
export class UpdateSlotUseCase implements IUpdateSlotUseCase {
  constructor(private _slotRepo: IMentorshipSlotRepository) {}

  async execute(
    slotId: string,
    dto: UpdateSlotDto,
  ): Promise<MentorshipSlot | null> {
    // Check if slot exists
    const existingSlot = await this._slotRepo.findById(slotId);
    if (!existingSlot) {
      return null;
    }

    // Cannot update a booked or completed slot
    if (
      existingSlot.status === 'booked' ||
      existingSlot.status === 'completed'
    ) {
      throw new Error('Cannot update a booked or completed slot');
    }

    // If updating scheduledAt, validate it's in the future
    if (dto.scheduledAt) {
      const now = new Date();
      if (new Date(dto.scheduledAt) <= now) {
        throw new Error('Scheduled time must be in the future');
      }
    }

    // Create updated slot
    const updatedSlot = new MentorshipSlot(
      existingSlot.instructorId,
      dto.title ?? existingSlot.title,
      dto.description ?? existingSlot.description,
      dto.duration ?? existingSlot.duration,
      dto.price ?? existingSlot.price,
      dto.currency ?? existingSlot.currency,
      dto.scheduledAt ? new Date(dto.scheduledAt) : existingSlot.scheduledAt,
      existingSlot.status,
      existingSlot.maxBookings,
      existingSlot.currentBookings,
      dto.jobTitle ?? existingSlot.jobTitle,
      dto.tags ?? existingSlot.tags,
      dto.timezone ?? existingSlot.timezone,
      slotId,
      existingSlot.createdAt,
      new Date(),
    );

    return await this._slotRepo.save(updatedSlot);
  }
}
