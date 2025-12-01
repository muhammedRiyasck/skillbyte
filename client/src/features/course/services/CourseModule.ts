import { toast } from "sonner";
import api from "@shared/utils/AxiosInstance";

export const createModule = async (data: {courseId:string,order:number,moduleId:string,title:string,description:string}) => {
  try {
    const response = await api.post("/course/createmodule", data);
    return response.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    toast.error(message);
    throw new Error(message);
  }
};

export const updateModule = async (data: {moduleId:string,title:string,description:string}) => {
  try {
    const { moduleId, ...updateData } = data;
    const response = await api.patch(`/course/module/${moduleId}`, updateData);
    return response.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    toast.error(message);
    throw new Error(message);
  }
};

export const deleteModule = async (moduleId: string) => {
  try {
    const response = await api.delete(`/course/module/${moduleId}`);
    return response.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    toast.error(message);
    throw new Error(message);
  }
};
