import api from '@shared/utils/AxiosInstance';

export const getLessonPlayUrl = async (id: string) => {
  const response = await api.get(`/course/lesson/${id}/play`);
  return response.data;
};
