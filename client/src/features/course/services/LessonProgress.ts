import api from "@shared/utils/AxiosInstance";

interface LessonProgressData {
  lessonId: string;
  lastWatchedSecond: number;
  totalDuration: number;
  isCompleted: boolean;
}

export const updateLessonProgress = async (enrollmentId: string, data: LessonProgressData) => {
  const response = await api.patch(`/enrollment/${enrollmentId}/lesson-progress`, data);
  return response.data;
};
