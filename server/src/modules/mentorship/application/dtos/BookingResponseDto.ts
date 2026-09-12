export interface BookingResponseDto {
  bookingId: string;
  slotId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  studentAvatar?: string;
  slotDuration?: number;
  slotTitle?: string;
  slotDescription?: string;
  instructorId: string;
  instructorName?: string;
  instructorEmail?: string;
  instructorAvatar?: string;
  instructorJobTitle?: string;
  amount: number;
  currency: string;
  status: string;
  scheduledAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;
  videoRoomId: string | null;
  videoRoomUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
