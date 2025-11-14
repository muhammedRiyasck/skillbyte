import { toast } from "sonner";
import api from "@shared/utils/AxiosInstance";

interface ReqestPlayload {
    studentId:string;
    status?:string
}

export const blockStudent =  async (playload:ReqestPlayload) => {
  try {
    const response = await api.patch(`/students/change-status`,playload);
    return response.data;
  } catch (error:any) {
    toast.error(error.message);
    throw error
  }
};


export const unBlockStudent = async (playload:ReqestPlayload) => {
  try {
    const response = await api.patch(`/students/change-status`,playload);
    return response.data;
  } catch (error:any) {
    toast.error(error.message);
    throw error
  }
};
