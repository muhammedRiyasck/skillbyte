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

/** Executes the business logic for update slot. */
export class UpdateSlotUseCase implements IUpdateSlotUseCase {
  constructor(private _slotRepo: IMentorshipSlotRepository) {}

  /**
   * Execute for the UpdateSlot entity.
   *
   * @param dto - The data transfer object containing request details.
   * @returns The standardized HTTP response.
   */
  async execute(dto: UpdateSlotRequestDto): Promise<SlotResponseDto | null> {
    const { slotId, data } = dto;

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

    const newScheduledAt = data.scheduledAt
      ? new Date(data.scheduledAt)
      : existingSlot.scheduledAt;
    const newDuration = data.duration ?? existingSlot.duration;

    // If updating scheduledAt, validate it's in the future
    if (data.scheduledAt) {
      const now = new Date();
      if (newScheduledAt <= now) {
        throw new HttpError(
          'Scheduled time must be in the future',
          HttpStatusCode.BAD_REQUEST,
        );
      }
    }

    if (data.scheduledAt || data.duration) {
      const newEndTime = new Date(
        newScheduledAt.getTime() + newDuration * 60000,
      );
      const hasConflict = await this._slotRepo.hasOverlappingSlot(
        existingSlot.instructorId,
        newScheduledAt,
        newEndTime,
        slotId,
      );

      if (hasConflict) {
        throw new HttpError(
          'You already have an active slot scheduled during this time period.',
          HttpStatusCode.CONFLICT,
        );
      }
    }

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
      existingSlot.isRecurring,
      existingSlot.recurrenceGroupId,
      existingSlot.recurrenceRule,
    );

    const saved = await this._slotRepo.save(updatedSlot);
    return SlotResponseMapper.toResponseDto(saved);
  }
}
