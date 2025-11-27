import { toast } from "sonner";
import api from "@shared/utils/AxiosInstance";

export const updateCourseStatus = async (courseId: string, status: "list" | "unlist") => {
  try {
    const response = await api.patch(`/course/${courseId}/status`, { status });
    toast.success(`Course ${status}ed successfully`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message || "Failed to update course status");
    } else {
      toast.error("Failed to update course status");
    }
    throw error;
  }
};
