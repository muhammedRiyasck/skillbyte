import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import {
  MentorshipSlot,
  SlotStatus,
} from '../../domain/entities/MentorshipSlot';
import { CreateSlotDto } from '../dtos/SlotDto';
import { SlotResponseDto } from '../dtos/SlotResponseDto';
import { SlotResponseMapper } from '../mappers/SlotResponseMapper';
import { ICreateSlotUseCase } from '../interfaces/ISlotUseCases';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/**
 * Use case for creating a new mentorship slot.
 */
export class CreateSlotUseCase implements ICreateSlotUseCase {
  constructor(
    private _slotRepo: IMentorshipSlotRepository,
    private _instructorRepo: IInstructorRepository,
  ) {}

  async execute(dto: CreateSlotDto): Promise<SlotResponseDto> {
    // Check for overlapping slots
    const startTime = new Date(dto.scheduledAt);
    const endTime = new Date(startTime.getTime() + dto.duration * 60000);
    const hasOverlap = await this._slotRepo.hasOverlappingSlot(
      dto.instructorId,
      startTime,
      endTime,
    );

    if (hasOverlap) {
      throw new HttpError(
        'You already have an active slot scheduled during this time period.',
        HttpStatusCode.CONFLICT, // 409 Conflict
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

    const slot = new MentorshipSlot(
      dto.instructorId,
      dto.title,
      dto.description,
      dto.duration,
      dto.price,
      dto.currency || 'INR',
      startTime,
      SlotStatus.AVAILABLE,
      1, // maxBookings
      0, // currentBookings
      jobTitle,
      dto.tags || [],
      dto.timezone || 'UTC',
    );

    const saved = await this._slotRepo.save(slot);
    return SlotResponseMapper.toResponseDto(saved);
  }
}
