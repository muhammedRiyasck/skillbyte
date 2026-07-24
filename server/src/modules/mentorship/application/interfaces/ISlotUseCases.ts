import {
  CreateSlotDto,
  UpdateSlotRequestDto,
  SlotFiltersDto,
  GetInstructorSlotsDto,
} from '../dtos/SlotDto';
import { SlotResponseDto } from '../dtos/SlotResponseDto';

export interface ICreateSlotUseCase {
  execute(dto: CreateSlotDto): Promise<SlotResponseDto>;
}

export interface IGetInstructorSlotsUseCase {
  execute(dto: GetInstructorSlotsDto): Promise<SlotResponseDto[]>;
}

export interface IUpdateSlotUseCase {
  execute(dto: UpdateSlotRequestDto): Promise<SlotResponseDto | null>;
}

export interface IDeleteSlotUseCase {
  execute(slotId: string): Promise<void>;
}

export interface IGetSlotsByJobTitleUseCase {
  execute(jobTitle: string): Promise<SlotResponseDto[]>;
}

export interface IGetAvailableSlotsUseCase {
  execute(
    filters?: SlotFiltersDto,
    studentId?: string,
  ): Promise<SlotResponseDto[]>;
}

export interface IGetSlotByIdUseCase {
  execute(slotId: string): Promise<SlotResponseDto | null>;
}

export interface IGetUniqueTagsUseCase {
  execute(): Promise<string[]>;
}
