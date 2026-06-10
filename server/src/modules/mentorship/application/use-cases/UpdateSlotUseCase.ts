import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import {
  MentorshipSlot,
  SlotStatus,
} from '../../domain/entities/MentorshipSlot';
import { UpdateSlotRequestDto } from '../dtos/SlotDto';
import { SlotResponseDto } from '../dtos/SlotResponseDto';
import { SlotResponseMapper } from '../mappers/SlotResponseMapper';
import { IUpdateSlotUseCase } from '../interfaces/ISlotUseCases';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/**
 * Use case for updating an existing mentorship slot.
 */
export class UpdateSlotUseCase implements IUpdateSlotUseCase {
  constructor(private _slotRepo: IMentorshipSlotRepository) {}

  async execute(
    dto: UpdateSlotRequestDto,
  ): Promise<SlotResponseDto | null> {
    const { slotId, data } = dto;
    // Check if slot exists
    const existingSlot = await this._slotRepo.findById(slotId);
    if (!existingSlot) {
      return null;
    }

    // Cannot update a booked or completed slot
    if (
      existingSlot.status === SlotStatus.BOOKED ||
      existingSlot.status === SlotStatus.COMPLETED
    ) {
      throw new HttpError(
        'Cannot update a booked or completed slot',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // If updating scheduledAt, validate it's in the future
    if (data.scheduledAt) {
      const now = new Date();
      if (new Date(data.scheduledAt) <= now) {
        throw new HttpError(
          'Scheduled time must be in the future',
          HttpStatusCode.BAD_REQUEST,
        );
      }
    }

    // Create updated slot
    const updatedSlot = new MentorshipSlot(
      existingSlot.instructorId,
      data.title ?? existingSlot.title,
      data.description ?? existingSlot.description,
      data.duration ?? existingSlot.duration,
      data.price ?? existingSlot.price,
      data.currency ?? existingSlot.currency,
      data.scheduledAt ? new Date(data.scheduledAt) : existingSlot.scheduledAt,
      existingSlot.status,
      existingSlot.maxBookings,
      existingSlot.currentBookings,
      data.jobTitle ?? existingSlot.jobTitle,
      data.tags ?? existingSlot.tags,
      data.timezone ?? existingSlot.timezone,
      slotId,
      existingSlot.instructorDetails,
      existingSlot.createdAt,
      new Date(),
    );

    const saved = await this._slotRepo.save(updatedSlot);
    return SlotResponseMapper.toResponseDto(saved);
  }
}
