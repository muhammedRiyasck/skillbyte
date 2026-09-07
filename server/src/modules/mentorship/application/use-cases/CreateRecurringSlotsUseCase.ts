import crypto from 'crypto';
import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import {
  MentorshipSlot,
  SlotStatus,
  RecurrenceRule,
} from '../../domain/entities/MentorshipSlot';
import { CreateRecurringSlotDto } from '../dtos/SlotDto';
import { CreateRecurringSlotResponseDto } from '../dtos/SlotResponseDto';
import { SlotResponseMapper } from '../mappers/SlotResponseMapper';
import { ICreateRecurringSlotsUseCase } from '../interfaces/ISlotUseCases';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class CreateRecurringSlotsUseCase
  implements ICreateRecurringSlotsUseCase
{
  constructor(
    private _slotRepo: IMentorshipSlotRepository,
    private _instructorRepo: IInstructorRepository,
  ) {}

  async execute(
    dto: CreateRecurringSlotDto,
  ): Promise<CreateRecurringSlotResponseDto> {
    const { recurrence } = dto;
    const startDate = new Date(recurrence.startDate);
    const endDate = new Date(recurrence.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new HttpError(
        'Invalid start or end date',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (endDate < startDate) {
      throw new HttpError(
        'End date must be on or after start date',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Max 90-day window limit
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      throw new HttpError(
        'Recurring slots can only be scheduled for up to 90 days in advance',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Parse time "HH:mm"
    const [hours, minutes] = recurrence.time.split(':').map(Number);
    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      throw new HttpError(
        'Invalid time format. Expected HH:mm',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (
      recurrence.frequency === 'weekly' &&
      (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0)
    ) {
      throw new HttpError(
        'At least one day of the week must be selected for weekly recurrence',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // specific job title check
    let jobTitle = dto.jobTitle;
    if (!jobTitle) {
      const instructor = await this._instructorRepo.findById(dto.instructorId);
      if (!instructor) {
        throw new HttpError('Instructor not found', HttpStatusCode.NOT_FOUND);
      }
      jobTitle = instructor.jobTitle;
    }

    if (!jobTitle) {
      throw new HttpError(
        'Instructor job title is required',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const recurrenceGroupId = crypto.randomUUID();
    const recurrenceRule: RecurrenceRule = {
      frequency: recurrence.frequency,
      daysOfWeek: recurrence.daysOfWeek,
      startDate,
      endDate,
      time: recurrence.time,
    };

    // Generate candidate start times
    const now = new Date();
    const candidateDates: Date[] = [];

    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    const endNorm = new Date(endDate);
    endNorm.setHours(23, 59, 59, 999);

    const timezoneOffset = dto.timezoneOffset;

    while (current <= endNorm) {
      const dayOfWeek = current.getDay(); // 0 = Sun, 1 = Mon ...
      const shouldInclude =
        recurrence.frequency === 'daily' ||
        (recurrence.daysOfWeek && recurrence.daysOfWeek.includes(dayOfWeek));

      if (shouldInclude) {
        let slotStartTime: Date;
        if (typeof timezoneOffset === 'number') {
          const utcMs =
            Date.UTC(
              current.getFullYear(),
              current.getMonth(),
              current.getDate(),
              hours,
              minutes,
              0,
              0,
            ) +
            timezoneOffset * 60 * 1000;
          slotStartTime = new Date(utcMs);
        } else {
          slotStartTime = new Date(
            current.getFullYear(),
            current.getMonth(),
            current.getDate(),
            hours,
            minutes,
            0,
            0,
          );
        }

        // Only include future slots
        if (slotStartTime > now) {
          candidateDates.push(slotStartTime);
        }
      }

      current.setDate(current.getDate() + 1);
    }

    if (candidateDates.length === 0) {
      throw new HttpError(
        'No valid future dates found in the selected recurrence range.',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (candidateDates.length > 60) {
      throw new HttpError(
        `Recurrence pattern generates ${candidateDates.length} slots, exceeding the maximum limit of 60 slots per batch.`,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const validSlots: MentorshipSlot[] = [];
    let skippedCount = 0;

    for (const slotStart of candidateDates) {
      const slotEnd = new Date(slotStart.getTime() + dto.duration * 60000);
      const hasOverlap = await this._slotRepo.hasOverlappingSlot(
        dto.instructorId,
        slotStart,
        slotEnd,
      );

      if (hasOverlap) {
        skippedCount++;
      } else {
        const slot = new MentorshipSlot(
          dto.instructorId,
          dto.title,
          dto.description,
          dto.duration,
          dto.price,
          dto.currency || 'INR',
          slotStart,
          SlotStatus.AVAILABLE,
          1,
          0,
          jobTitle,
          dto.tags || [],
          dto.timezone || 'UTC',
          undefined,
          undefined,
          new Date(),
          new Date(),
          true,
          recurrenceGroupId,
          recurrenceRule,
        );
        validSlots.push(slot);
      }
    }

    if (validSlots.length === 0) {
      throw new HttpError(
        'All slots in the recurring series conflict with existing scheduled slots.',
        HttpStatusCode.CONFLICT,
      );
    }

    const savedSlots = await this._slotRepo.saveMany(validSlots);

    return {
      recurrenceGroupId,
      createdCount: savedSlots.length,
      skippedCount,
      slots: savedSlots.map(SlotResponseMapper.toResponseDto),
    };
  }
}
