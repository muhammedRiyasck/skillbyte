import { MentorshipSlot } from '../../domain/entities/MentorshipSlot';
import { CreateSlotDto, UpdateSlotDto, SlotFiltersDto } from '../dtos/SlotDto';

export interface ICreateSlotUseCase {
  execute(dto: CreateSlotDto): Promise<MentorshipSlot>;
}

export interface IGetInstructorSlotsUseCase {
  execute(instructorId: string): Promise<MentorshipSlot[]>;
}

export interface IUpdateSlotUseCase {
  execute(slotId: string, dto: UpdateSlotDto): Promise<MentorshipSlot | null>;
}

export interface IDeleteSlotUseCase {
  execute(slotId: string): Promise<void>;
}

export interface IGetSlotsByJobTitleUseCase {
  execute(jobTitle: string): Promise<MentorshipSlot[]>;
}

export interface IGetAvailableSlotsUseCase {
  execute(filters?: SlotFiltersDto): Promise<MentorshipSlot[]>;
}

export interface IGetSlotByIdUseCase {
  execute(slotId: string): Promise<MentorshipSlot | null>;
}
