import api from "@shared/utils/AxiosInstance";
import type { IReqestPlayload } from '../types/IReqestPlayload'

export const approveRequest = async (playload: IReqestPlayload) => {
  const response = await api.patch(`/instructors/approve`, playload);
  return response.data;
};

export const declineRequest = async (playload: IReqestPlayload) => {
  const response = await api.patch(`/instructors/decline`, playload);
  return response.data;
};

export const deleteInstructor = async (id: string) => {
  const response = await api.delete(`/instructors/${id}`);
  return response.data;
};

export const changeInstructorStatusRequest = async (playload: IReqestPlayload) => {
  const response = await api.patch(`instructors/${playload.id}/status`, playload);
  return response.data;
};
