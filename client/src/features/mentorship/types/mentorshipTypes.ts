import { BookingStatus, CancelledBy } from "@shared/enums/BookingStatus";
import { SlotStatus } from "@shared/enums/SlotStatus";

export interface IMentorshipSlot {
  slotId: string;
  instructorId: string;
  scheduledAt: string; // ISO String
  duration: number; // minutes
  price: number;
  currency: string;
  status: SlotStatus;
  title?: string;
  description?: string;
  instructorDetails?: {
    name: string;
    profilePicture?: string;
    jobTitle: string;
  };
  tags?: string[];
}

export interface IMentorshipBooking {
  bookingId: string;
  slotId: string | IMentorshipSlot;
  studentId: string | { id: string; name: string; email: string; profilePicture?: string };
  instructorId: string | { id: string; name: string; jobTitle?: string; profilePicture?: string };
  paymentId?: string;
  amount: number;
  currency: string;
  status: BookingStatus;
  videoRoomId?: string;
  videoRoomUrl?: string;
  scheduledAt: string; // ISO String
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: CancelledBy | null;
  createdAt: string;
}

export interface CreateSlotRequest {
  scheduledAt: Date | string; // Start Time
  duration: number; // minutes
  price: number;
  title?: string | undefined;
  description?: string | undefined;
  status?: SlotStatus;
  tags?: string[];
}

export interface UpdateSlotRequest {
  scheduledAt?: Date | string | undefined;
  duration?: number | undefined;
  price?: number | undefined;
  status?: SlotStatus;
  title?: string | undefined;
  description?: string | undefined;
  tags?: string[];
}

export interface PaymentInfo {
  id: string;
  client_secret?: string;
}

export interface BookSlotResponse {
  bookingId: string;
  paymentInfo: PaymentInfo;
}

export interface SlotFilters {
  search?: string;
  jobTitle?: string;
  minPrice?: number;
  maxPrice?: number;
  fromDate?: string | Date;
  toDate?: string | Date;
  tags?: string;
  page?: number;
  limit?: number;
}

export interface InstructorSlotFilters {
  status?: SlotStatus;
  fromDate?: string | Date;
  toDate?: string | Date;
  page?: number;
  limit?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
}

export interface InstructorBookingFilters {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}

export interface StudentBookingFilters {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  fromDate?: string | Date;
  toDate?: string | Date;
}
