export interface BookSlotDto {
  slotId: string;
  studentId: string;
  providerName: string;
}

export interface CancelBookingDto {
  bookingId: string;
  cancelledBy: 'student' | 'instructor' | 'system';
}

export interface GetStudentBookingsDto {
  studentId: string;
  page?: number;
  limit?: number;
  status?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface GetInstructorBookingsDto {
  instructorId: string;
  page?: number;
  limit?: number;
  status?: string;
  upcoming?: boolean;
}

export interface ValidateVideoRoomAccessDto {
  roomId: string;
  userId: string;
  userRole: 'student' | 'instructor';
}
