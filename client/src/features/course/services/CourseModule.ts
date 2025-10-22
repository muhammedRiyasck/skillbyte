import { toast } from "sonner";
import api from "@shared/utils/AxiosInstance";

export const createModule = async (data: {courseId:string,order:number,moduleId:string,title:string,description:string}) => {
  try {
    const response = await api.post("/course/createmodule", data);
    return response.data;
  } catch (error: any) {
    toast.error(error.message);
    throw new Error(error);
  }
};
