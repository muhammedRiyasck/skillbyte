export interface IMentorshipSlot {
  slotId: string;
  instructorId: string;
  scheduledAt: string; // ISO String
  duration: number; // minutes
  price: number;
  currency: string;
  status: 'available' | 'booked' | 'cancelled' | 'maintenance';
  title?: string;
  description?: string;
}

export interface IMentorshipBooking {
  bookingId: string;
  slotId: string;
  studentId: string | { _id: string; name: string; email: string; profileImageUrl?: string };
  instructorId: string | { _id: string; name: string; jobTitle?: string; profileImageUrl?: string };
  paymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  videoRoomId?: string;
  videoRoomUrl?: string;
  scheduledAt: string; // ISO String
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface CreateSlotRequest {
  scheduledAt: Date | string; // Start Time
  duration: number; // minutes
  price: number;
  title?: string | undefined;
  description?: string | undefined;
  status?: 'available' | 'booked' | 'cancelled' | 'maintenance';
}

export interface UpdateSlotRequest {
  scheduledAt?: Date | string | undefined;
  duration?: number | undefined;
  price?: number | undefined;
  status?: 'available' | 'booked' | 'cancelled' | 'maintenance';
  title?: string | undefined;
  description?: string | undefined;
}

export interface PaymentInfo {
  id: string;
  client_secret?: string;
}

export interface BookSlotResponse {
  bookingId: string;
  paymentInfo: PaymentInfo;
}
