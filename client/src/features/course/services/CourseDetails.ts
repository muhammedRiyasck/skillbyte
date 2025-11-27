import api from "@shared/utils/AxiosInstance";
import type{ CourseDetailsResponse } from "../types/CourseDetails";
import { toast } from "sonner";

export const getCourseDetails = async (courseId: string): Promise<CourseDetailsResponse> => {
  try {
    const response = await api.get(`/course/details/${courseId}`, {
      params: { include: 'modules,lessons,instructor' }
    });
    return response.data;
  } catch (error: unknown) {
    toast.error((error as Error).message || 'Failed to fetch course details');
    throw new Error('Failed to fetch course details');
  }
};
