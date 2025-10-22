import { toast } from "sonner";
import api from "@shared/utils/AxiosInstance";

interface ReqestPlayload {
    studentId:string;
    status?:string
}

export const blockStudent =  async (playload:ReqestPlayload) => {
  try {
    console.log(playload)
    const response = await api.patch(`/students/change-status`,playload);
    return response.data;
  } catch (error:any) {
    console.log(error)
    toast.error(error.message);
    throw error
  }
};


export const unBlockStudent = async (playload:ReqestPlayload) => {
  try {
    const response = await api.patch(`/students/change-status`,playload);
    return response.data;
  } catch (error:any) {
    console.log(error)
    toast.error(error.message);
    throw error
  }
};
