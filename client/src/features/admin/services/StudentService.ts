import api from "@shared/utils/AxiosInstance";

interface RequestPayload {
    studentId: string;
    status?: string;
}

export const changeStudentStatus = async (payload: RequestPayload) => {
  const response = await api.patch(`/students/change-status`, payload);
  return response.data;
};
