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
  content?: string;
  type?: 'text' |'video'| 'image' | 'document';
  fileUrl?: string;
  fileName?: string;
}

export interface IUploadFileResponse {
  url: string;
  type: 'video'| 'image' | 'document';
  fileName: string;
  mimeType: string;
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
    const { conversationId, ...body } = data;
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, body);
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

  /**
   * Uploads a file to Cloudinary via the server and returns the URL + metadata.
   * Call this before sendMessage when attaching a file.
   */
  uploadFile: async (
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<IUploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    });
    return response.data.data as IUploadFileResponse;
  },
};


