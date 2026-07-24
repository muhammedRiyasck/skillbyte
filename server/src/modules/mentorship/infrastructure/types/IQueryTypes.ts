import { BookingStatus } from '../../domain/entities/MentorshipBooking';
import { SlotStatus } from '../../domain/entities/MentorshipSlot';

export interface findByInstructorIdQueryType {
  instructorId: string;
  status?: BookingStatus | SlotStatus;
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
    $in?: SlotStatus[];
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
  $or?: Record<string, unknown>[];
}
