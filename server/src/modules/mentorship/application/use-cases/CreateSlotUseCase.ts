import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { MentorshipSlot } from '../../domain/entities/MentorshipSlot';
import { CreateSlotDto } from '../dtos/SlotDto';
import { ICreateSlotUseCase } from '../interfaces/ISlotUseCases';

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
      throw new Error('Scheduled time must be in the future');
    }

    // specific job title check
    let jobTitle = dto.jobTitle;
    if (!jobTitle) {
      const instructor = await this._instructorRepo.findById(dto.instructorId);
      if (!instructor) {
        throw new Error('Instructor not found');
      }
      jobTitle = instructor.jobTitle;
    }

    if (!jobTitle) {
      throw new Error('Instructor job title is required');
    }

    const slot = new MentorshipSlot(
      dto.instructorId,
      dto.title,
      dto.description,
      dto.duration,
      dto.price,
      dto.currency,
      new Date(dto.scheduledAt),
      'available',
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
