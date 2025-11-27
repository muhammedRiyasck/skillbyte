import { toast } from "sonner";
import api from "@shared/utils/AxiosInstance";

interface RequestPayload {
    studentId: string;
    status?: string;
}

export const changeStudentStatus = async (payload: RequestPayload) => {
  try {
    const response = await api.patch(`/students/change-status`, payload);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('An error occurred');
    }
    throw error;
  }
};


