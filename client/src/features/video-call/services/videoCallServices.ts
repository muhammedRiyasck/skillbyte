import api from "@shared/utils/AxiosInstance";

export const validateVideoRoomAccess = async (
  roomId: string
): Promise<{ bookingId: string; isValid: boolean }> => {
  const response = await api.post(`/mentorship/video-room/${roomId}/validate`);
  return response.data.data;
};
