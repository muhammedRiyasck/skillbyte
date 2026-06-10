import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { GetInstructorSlotsDto } from '../dtos/SlotDto';
import { SlotStatus } from '../../domain/entities/MentorshipSlot';
import { IGetInstructorSlotsUseCase } from '../interfaces/ISlotUseCases';
import { SlotResponseDto } from '../dtos/SlotResponseDto';
import { SlotResponseMapper } from '../mappers/SlotResponseMapper';

/**
 * Use case for retrieving all slots for a specific instructor.
 */
export class GetInstructorSlotsUseCase implements IGetInstructorSlotsUseCase {
  constructor(private _slotRepo: IMentorshipSlotRepository) {}

  async execute(dto: GetInstructorSlotsDto): Promise<SlotResponseDto[]> {
    const filters = dto.filters
      ? { ...dto.filters, status: dto.filters.status as SlotStatus | undefined }
      : undefined;
    const slots = await this._slotRepo.findByInstructorId(dto.instructorId, filters);
    return slots.map(SlotResponseMapper.toResponseDto);
  }
}
