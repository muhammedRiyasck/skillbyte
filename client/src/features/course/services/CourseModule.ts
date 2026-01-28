import api from "@shared/utils/AxiosInstance";

export const createModule = async (data: {courseId:string,order:number,moduleId:string,title:string,description:string}) => {
  const response = await api.post("/course/createmodule", data);
  return response.data;
};

export const updateModule = async (data: {moduleId:string,title:string,description:string}) => {
  const { moduleId, ...updateData } = data;
  const response = await api.patch(`/course/module/${moduleId}`, updateData);
  return response.data;
};

export const deleteModule = async (moduleId: string) => {
  const response = await api.delete(`/course/module/${moduleId}`);
  return response.data;
};
