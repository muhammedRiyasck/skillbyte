import api from "@shared/utils/AxiosInstance";
import type { CourseDetailsResponse } from "../types/CourseDetails";

export const getCourseDetails = async (id: string): Promise<CourseDetailsResponse> => {
  const response = await api.get(`/course/details/${id}`, {
    params: { include: 'modules,lessons,instructor' }
  });
  return response.data;
};

