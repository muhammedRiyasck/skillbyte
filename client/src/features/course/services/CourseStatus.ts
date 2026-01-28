import { toast } from "sonner";
import api from "@shared/utils/AxiosInstance";

export const updateCourseStatus = async (courseId: string, status: "list" | "unlist") => {
  const response = await api.patch(`/course/${courseId}/status`, { status });
  toast.success(`Course ${status}ed successfully`);
  return response.data;
};

export const blockCourse = async (courseId: string, isBlocked: boolean) => {
  const response = await api.patch(`/course/${courseId}/block`, { isBlocked });
  toast.success(`Course ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
  return response.data;
};
