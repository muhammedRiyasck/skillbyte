import { MentorshipSlot } from '../../domain/entities/MentorshipSlot';
import { SlotResponseDto } from '../dtos/SlotResponseDto';

/** Handles slot response mapper functionality. */
export class SlotResponseMapper {
  /**
   * To response dto for the SlotResponseMapper entity.
   *
   * @param slot - The slot information.
   * @returns The standardized HTTP response.
   */
  static toResponseDto(slot: MentorshipSlot): SlotResponseDto {
    return {
      slotId: slot.slotId!,
      instructorId: slot.instructorId,
      title: slot.title,
      description: slot.description,
      duration: slot.duration,
      price: slot.price,
      currency: slot.currency,
      scheduledAt: slot.scheduledAt,
      status: slot.status,
      jobTitle: slot.jobTitle,
      tags: slot.tags,
      timezone: slot.timezone,
      instructorDetails: slot.instructorDetails,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
      isRecurring: slot.isRecurring,
      recurrenceGroupId: slot.recurrenceGroupId,
      recurrenceRule: slot.recurrenceRule,
    };
  }
}
