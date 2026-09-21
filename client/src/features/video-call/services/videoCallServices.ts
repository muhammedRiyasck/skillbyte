import api from "@shared/utils/AxiosInstance";

import { BookingStatus } from "@shared/enums/BookingStatus";

export interface VideoRoomAccess {
  bookingId: string;
  isValid: boolean;
  status: BookingStatus;
  roomToken: string;
  iceServers: RTCIceServer[];
}

export const validateVideoRoomAccess = async (
  roomId: string
): Promise<VideoRoomAccess> => {
  const response = await api.post(`/mentorship/video-room/${roomId}/validate`);
  return response.data.data;
};
