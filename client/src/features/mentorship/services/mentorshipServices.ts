import api from "@shared/utils/AxiosInstance";
import type { CreateSlotRequest, UpdateSlotRequest, IMentorshipSlot, IMentorshipBooking, BookSlotResponse } from "../types/mentorshipTypes";

// ==================== Slots ====================

export const createSlot = async (data: CreateSlotRequest): Promise<IMentorshipSlot> => {
  const response = await api.post('/mentorship/slots', data);
  return response.data.data.slot;
};

export const getInstructorSlots = async (): Promise<IMentorshipSlot[]> => {
  const response = await api.get('/mentorship/slots/instructor');
  return response.data.data.slots;
};

export const updateSlot = async (slotId: string, data: UpdateSlotRequest): Promise<IMentorshipSlot> => {
  const response = await api.put(`/mentorship/slots/${slotId}`, data);
  return response.data.data.slot;
};

export const deleteSlot = async (slotId: string): Promise<void> => {
  await api.delete(`/mentorship/slots/${slotId}`);
};

export const getAvailableSlots = async (): Promise<IMentorshipSlot[]> => {
  const response = await api.get('/mentorship/slots');
  return response.data.data.slots;
};

export const getSlotsByJobTitle = async (jobTitle: string): Promise<IMentorshipSlot[]> => {
  const response = await api.get(`/mentorship/slots/job-title/${jobTitle}`);
  return response.data.data.slots;
};

// ==================== Bookings ====================

export const getInstructorBookings = async (): Promise<IMentorshipBooking[]> => {
  const response = await api.get('/mentorship/bookings/instructor');
  return response.data.data.bookings;
};

export const getStudentBookings = async (): Promise<IMentorshipBooking[]> => {
  const response = await api.get('/mentorship/bookings/student');
  return response.data.data.bookings;
};

export const bookSlot = async (data: { slotId: string; providerName: string }): Promise<BookSlotResponse> => {
  const response = await api.post('/mentorship/book', data);
  return response.data.data;
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
  await api.post(`/mentorship/bookings/${bookingId}/cancel`);
};
