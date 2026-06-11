import { MentorshipSlot } from '../../domain/entities/MentorshipSlot';
import { SlotResponseDto } from '../dtos/SlotResponseDto';

export class SlotResponseMapper {
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
    };
  }
}
