export interface BookSlotDto {
  slotId: string;
  studentId: string;
  providerName: string;
}

export interface CancelBookingDto {
  bookingId: string;
  cancelledBy: 'student' | 'instructor';
}
