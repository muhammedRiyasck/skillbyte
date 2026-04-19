import api from "@shared/utils/AxiosInstance";

import { BookingStatus } from "@shared/enums/BookingStatus";

export const validateVideoRoomAccess = async (
  roomId: string
): Promise<{ bookingId: string; isValid: boolean; status: BookingStatus }> => {
  const response = await api.post(`/mentorship/video-room/${roomId}/validate`);
  return response.data.data;
};
