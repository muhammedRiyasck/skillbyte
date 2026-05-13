import { CreateSlotDto, UpdateSlotDto } from '../dtos/SlotDto';

export class MentorshipMapper {
  static toCreateSlotDto(
    data: CreateSlotDto,
    instructorId: string,
  ): CreateSlotDto {
    return {
      instructorId,
      title: data.title,
      description: data.description,
      duration: data.duration,
      price: data.price,
      currency: data.currency,
      scheduledAt: new Date(data.scheduledAt),
      jobTitle: data.jobTitle,
      tags: data.tags,
      timezone: data.timezone,
    };
  }

  static toUpdateSlotDto(data: UpdateSlotDto): UpdateSlotDto {
    return {
      title: data.title,
      description: data.description,
      duration: data.duration,
      price: data.price,
      currency: data.currency,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      jobTitle: data.jobTitle,
      tags: data.tags,
      timezone: data.timezone,
    };
  }
}
