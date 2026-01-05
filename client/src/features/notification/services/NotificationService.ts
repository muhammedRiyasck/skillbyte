import api from "../../../shared/utils/AxiosInstance";
import type { ApiResponse } from "../../../shared/types/Common";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getUserNotifications = async (
  page?: number,
  limit?: number,
): Promise<ApiResponse<{ notifications: Notification[]; pagination: PaginationData }>> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  
  const response = await api.get(`/notifications?${params.toString()}`);
  return response.data;
};

export const markNotificationAsRead = async (id: string): Promise<ApiResponse<Notification>> => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async (): Promise<ApiResponse<void>> => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

export const sendTestNotification = async (): Promise<ApiResponse<Notification>> => {
  const response = await api.post('/notifications/test');
  return response.data;
};
