import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { MentorshipSlot } from '../../domain/entities/MentorshipSlot';
import { UpdateSlotDto } from '../dtos/SlotDto';
import { IUpdateSlotUseCase } from '../interfaces/ISlotUseCases';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

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
      throw new HttpError(
        'Cannot update a booked or completed slot',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // If updating scheduledAt, validate it's in the future
    if (dto.scheduledAt) {
      const now = new Date();
      if (new Date(dto.scheduledAt) <= now) {
        throw new HttpError(
          'Scheduled time must be in the future',
          HttpStatusCode.BAD_REQUEST,
        );
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
      existingSlot.instructorDetails,
      existingSlot.createdAt,
      new Date(),
    );

    return await this._slotRepo.save(updatedSlot);
  }
}
