import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { GetInstructorSlotsDto } from '../dtos/SlotDto';
import { SlotStatus } from '../../domain/entities/MentorshipSlot';
import { IGetInstructorSlotsUseCase } from '../interfaces/ISlotUseCases';
import { SlotResponseDto } from '../dtos/SlotResponseDto';
import { SlotResponseMapper } from '../mappers/SlotResponseMapper';

/** Executes the business logic for get instructor slots. */
export class GetInstructorSlotsUseCase implements IGetInstructorSlotsUseCase {
  constructor(private _slotRepo: IMentorshipSlotRepository) {}

  /**
   * Execute for the GetInstructorSlots entity.
   *
   * @param dto - The data transfer object containing request details.
   * @returns The standardized HTTP response.
   */
  async execute(dto: GetInstructorSlotsDto): Promise<SlotResponseDto[]> {
    const filters = dto.filters
      ? { ...dto.filters, status: dto.filters.status as SlotStatus | undefined }
      : undefined;
    const slots = await this._slotRepo.findByInstructorId(
      dto.instructorId,
      filters,
    );
    return slots.map(SlotResponseMapper.toResponseDto);
  }
}
