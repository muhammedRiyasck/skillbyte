import api from "@shared/utils/AxiosInstance";
import { UserAccountStatus } from "@shared/enums/UserAccountStatus";

interface RequestPayload {
  id: string;
  status?: UserAccountStatus;
}

export const changeStudentStatus = async (payload: RequestPayload) => {
  const response = await api.patch(`/students/change-status`, payload);
  return response.data;
};
