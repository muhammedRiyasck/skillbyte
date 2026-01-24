import api from "@shared/utils/AxiosInstance";
import type { CreateSlotRequest, UpdateSlotRequest, IMentorshipSlot, SlotFilters, InstructorSlotFilters } from "../types/mentorshipTypes";

// ==================== Slots ====================

export const createSlot = async (data: CreateSlotRequest): Promise<IMentorshipSlot> => {
  const response = await api.post('/mentorship/slots', data);
  return response.data.data.slot;
};

export const getInstructorSlots = async (filters: InstructorSlotFilters = {}): Promise<IMentorshipSlot[]> => {
  const response = await api.get('/mentorship/slots/instructor', { params: filters });
  return response.data.data.slots;
};

export const updateSlot = async (slotId: string, data: UpdateSlotRequest): Promise<IMentorshipSlot> => {
  const response = await api.put(`/mentorship/slots/${slotId}`, data);
  return response.data.data.slot;
};

export const deleteSlot = async (slotId: string): Promise<void> => {
  await api.delete(`/mentorship/slots/${slotId}`);
};

export const getAvailableSlots = async (filters: SlotFilters = {}): Promise<IMentorshipSlot[]> => {
  const response = await api.get('/mentorship/slots', { params: filters });
  return response.data.data.slots;
};

export const getUniqueTags = async (): Promise<string[]> => {
  const response = await api.get('/mentorship/slots/tags');
  return response.data.data.tags;
};

export const getSlotsByJobTitle = async (jobTitle: string): Promise<IMentorshipSlot[]> => {
  const response = await api.get(`/mentorship/slots/job-title/${jobTitle}`);
  return response.data.data.slots;
};



