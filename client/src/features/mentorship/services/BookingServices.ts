import api from "@shared/utils/AxiosInstance";
import type { BookSlotResponse, IMentorshipBooking, InstructorBookingFilters, StudentBookingFilters } from "../types/mentorshipTypes";

// ==================== Bookings ====================

export const getInstructorBookings = async (filters: InstructorBookingFilters = {}): Promise<IMentorshipBooking[]> => {
  const response = await api.get('/mentorship/bookings/instructor', { params: filters });
  return response.data.data.bookings;
};

export const getStudentBookings = async (filters: StudentBookingFilters = {}): Promise<IMentorshipBooking[]> => {
  const response = await api.get('/mentorship/bookings/student', { params: filters });
  return response.data.data.bookings;
};

export const bookSlot = async (data: { slotId: string; providerName: string }): Promise<BookSlotResponse> => {
  const response = await api.post('/mentorship/book', data);
  return response.data.data;
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
  await api.post(`/mentorship/bookings/${bookingId}/cancel`);
};
export const generateVideoRoom = async (bookingId: string): Promise<{ roomId: string; roomUrl: string }> => {
  const response = await api.get(`/mentorship/bookings/${bookingId}/video-room`);
  return response.data.data;
};
