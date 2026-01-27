import { BookingStatus } from '../../domain/entities/MentorshipBooking';
type slotStatus = 'available' | 'booked';

export interface findByInstructorIdQueryType {
  instructorId: string;
  status?: BookingStatus | slotStatus;
  scheduledAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export interface findByStudentIdQueryType {
  studentId: string;
  status?: BookingStatus;
  scheduledAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export interface findAvailableSlotsType {
  status?: {
    $in?: ['available', 'booked'];
  };
  scheduledAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  price?: {
    $lte?: number;
    $gte?: number;
  };
  tags?: {
    $in?: string[];
  };
}
