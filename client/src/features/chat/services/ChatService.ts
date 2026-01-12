import api from '@shared/utils/AxiosInstance';
import type { ApiResponse } from '@shared/types/Common';
import type { IMessage } from '../types/IMessage';
import type { IConversation } from '../types/IConversation';

export interface ICreateConversationRequest {
  studentId: string;
  instructorId: string;
  courseId: string;
}

export interface ISendMessageRequest {
  conversationId: string;
  content: string;
  type?: 'text' | 'image' | 'document';
  fileUrl?: string;
  fileName?: string;
}

export const ChatService = {
  createConversation: async (data: ICreateConversationRequest): Promise<ApiResponse<IConversation>> => {
    const response = await api.post('/chat/conversations', data);
    return response.data;
  },

  getConversations: async (): Promise<ApiResponse<IConversation[]>> => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  sendMessage: async (data: ISendMessageRequest): Promise<ApiResponse<IMessage>> => {
    const response = await api.post('/chat/messages', data);
    return response.data;
  },

  getMessages: async (
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<ApiResponse<IMessage[]>> => {
    const response = await api.get(
      `/chat/conversations/${conversationId}/messages`,
      {
        params: { limit, offset },
      },
    );
    return response.data;
  },

  markAsRead: async (conversationId: string): Promise<ApiResponse<void>> => {
    const response = await api.patch(
      `/chat/conversations/${conversationId}/read`,
    );
    return response.data;
  },
};
