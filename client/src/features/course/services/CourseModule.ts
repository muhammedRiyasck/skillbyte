import api from "@shared/utils/AxiosInstance";

export const createModule = async (data: { id: string, order: number, moduleId: string, title: string, description: string }) => {
  const response = await api.post("/course/createmodule", data);
  return response.data;
};

export const updateModule = async (data: { id: string, title: string, description: string }) => {
  const { id, ...updateData } = data;
  const response = await api.patch(`/course/module/${id}`, updateData);
  return response.data;
};

export const deleteModule = async (id: string) => {
  const response = await api.delete(`/course/module/${id}`);
  return response.data;
};
