import api from '@shared/utils/AxiosInstance';
import type { IQuizConfig, IQuizAnalytics, IQuizAttempt, IAnswer } from '../types/quiz.types';

const API_URL = '/quiz';

export const quizService = {
  // Instructor methods
  getConfig: async (courseId: string): Promise<IQuizConfig> => {
    const response = await api.get(`${API_URL}/config/${courseId}`);
    return response.data.data;
  },

  createConfig: async (configData: Partial<IQuizConfig>): Promise<IQuizConfig> => {
    const response = await api.post(`${API_URL}/config`, configData);
    return response.data.data;
  },

  updateConfig: async (courseId: string, configData: Partial<IQuizConfig>): Promise<IQuizConfig> => {
    const response = await api.put(`${API_URL}/config/${courseId}`, configData);
    return response.data.data;
  },

  getAnalytics: async (courseId: string, page: number = 1, limit: number = 10): Promise<IQuizAnalytics> => {
    const response = await api.get(`${API_URL}/analytics/${courseId}`, {
      params: { page, limit }
    });
    return response.data.data;
  },

  resetAttempts: async (courseId: string, userId: string): Promise<void> => {
    await api.delete(`${API_URL}/course/${courseId}/attempts/${userId}`);
  },

  // Student methods
  startAttempt: async (courseId: string): Promise<IQuizAttempt> => {
    const response = await api.post(`${API_URL}/start/${courseId}`);
    return response.data.data;
  },

  submitAttempt: async (attemptId: string, answers: IAnswer[]): Promise<IQuizAttempt> => {
    const response = await api.post(`${API_URL}/submit/${attemptId}`, { answers });
    return response.data.data;
  },

  getResult: async (courseId: string): Promise<IQuizAttempt> => {
    const response = await api.get(`${API_URL}/result/${courseId}`);
    return response.data.data;
  },

  getAllAttempts: async (courseId: string): Promise<IQuizAttempt[]> => {
    const response = await api.get(`${API_URL}/attempts/${courseId}`);
    return response.data.data;
  }
};
