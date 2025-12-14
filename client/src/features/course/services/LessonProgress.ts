import api from "@shared/utils/AxiosInstance";

interface LessonProgressData {
  lessonId: string;
  lastWatchedSecond: number;
  totalDuration: number;
  isCompleted: boolean;
}

export const updateLessonProgress = async (enrollmentId: string, data: LessonProgressData) => {
  try {
    const response = await api.patch(`/enrollment/${enrollmentId}/lesson-progress`, data);
    return response.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new Error(message);
  }
};
