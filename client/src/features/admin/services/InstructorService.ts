import api from "@shared/utils/AxiosInstance";
import type{IReqestPlayload} from '../types/IReqestPlayload'

export const approveRequest = async (playload:IReqestPlayload) => {
  const response = await api.patch(`/instructors/approve`,playload);
  return response.data;
};

export const declineRequest = async (playload:IReqestPlayload) => {
  const response = await api.patch(`/instructors/decline`,playload);
  return response.data;
};

export const deleteInstructor = async (instructorId: string) => {
  const response = await api.delete(`/instructors/${instructorId}`);
  return response.data;
};

export const changeInstructorStatusRequest = async (playload:IReqestPlayload) => {
  const response = await api.patch(`instructors/${playload.instructorId}/status`,playload);
  return response.data;
};
