import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import {
  MentorshipSlot,
  SlotStatus,
} from '../../domain/entities/MentorshipSlot';
import { CreateSlotDto } from '../dtos/SlotDto';
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

  async execute(dto: CreateSlotDto): Promise<MentorshipSlot> {
    // Validate scheduled time is in the future
    const now = new Date();
    if (new Date(dto.scheduledAt) <= now) {
      throw new HttpError(
        'Scheduled time must be in the future',
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

    const slot = new MentorshipSlot(
      dto.instructorId,
      dto.title,
      dto.description,
      dto.duration,
      dto.price,
      dto.currency,
      new Date(dto.scheduledAt),
      SlotStatus.AVAILABLE,
      1, // maxBookings
      0, // currentBookings
      jobTitle,
      dto.tags || [],
      dto.timezone || 'UTC',
    );

    const saved = await this._slotRepo.save(slot);
    return saved;
  }
}
