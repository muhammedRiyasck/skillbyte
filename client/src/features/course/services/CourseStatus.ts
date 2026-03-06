import { toast } from "sonner";
import api from "@shared/utils/AxiosInstance";
import { CourseStatus } from "@shared/enums/CourseStatus";

export const updateCourseStatus = async (id: string, status: CourseStatus) => {
  const response = await api.patch(`/course/${id}/status`, { status });
  toast.success(`Course ${status}ed successfully`);
  return response.data;
};

export const blockCourse = async (id: string, isBlocked: boolean) => {
  const response = await api.patch(`/course/${id}/block`, { isBlocked });
  toast.success(`Course ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
  return response.data;
};
