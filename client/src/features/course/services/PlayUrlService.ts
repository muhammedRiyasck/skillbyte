import api from '@shared/utils/AxiosInstance';

export const getLessonPlayUrl = async (lessonId: string) => {
  const response = await api.get(`/course/lesson/${lessonId}/play`);
  return response.data;
};
