import api from "@shared/utils/AxiosInstance";

interface RequestPayload {
  id: string;
  status?: string;
}

export const changeStudentStatus = async (payload: RequestPayload) => {
  const response = await api.patch(`/students/change-status`, payload);
  return response.data;
};
