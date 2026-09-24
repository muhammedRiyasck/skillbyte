import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { SlotFiltersDto } from '../dtos/SlotDto';
import { SlotResponseDto } from '../dtos/SlotResponseDto';
import { SlotResponseMapper } from '../mappers/SlotResponseMapper';
import { IGetAvailableSlotsUseCase } from '../interfaces/ISlotUseCases';

import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';

/** Executes the business logic for get available slots. */
export class GetAvailableSlotsUseCase implements IGetAvailableSlotsUseCase {
  constructor(
    private _slotRepo: IMentorshipSlotRepository,
    private _bookingRepo: IMentorshipBookingRepository,
  ) {}

  /**
   * Execute for the GetAvailableSlots entity.
   *
   * @param filters - The filters information.
   * @param studentId - The unique identifier for the student.
   * @returns The standardized HTTP response.
   */
  async execute(
    filters?: SlotFiltersDto,
    studentId?: string,
  ): Promise<SlotResponseDto[]> {
    let includeSlotId: string | undefined;
    let pendingBookingId: string | undefined;

    if (studentId) {
      const pendingBooking =
        await this._bookingRepo.findPendingByStudentId(studentId);
      if (pendingBooking && pendingBooking.slotId) {
        includeSlotId = String(pendingBooking.slotId);
        pendingBookingId = pendingBooking.bookingId;
      }
    }

    const slots = await this._slotRepo.findAvailableSlots({
      ...filters,
      includeSlotId,
    });

    return slots.map((slot) => {
      const dto = SlotResponseMapper.toResponseDto(slot);
      if (includeSlotId && slot.slotId === includeSlotId) {
        dto.isPendingForUser = true;
        dto.pendingBookingId = pendingBookingId;
      }
      return dto;
    });
  }
}
