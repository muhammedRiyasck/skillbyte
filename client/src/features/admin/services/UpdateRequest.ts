

import { toast } from "sonner";

import api from "../../../shared/utils/AxiosInstance";

interface ReqestPlayload {
    id:string;
    reason?:string
}

export const approveReqest = async (playload:ReqestPlayload) => {
  try {
    const response = await api.patch(`/instructors/approve`,playload);
    return response.data;
  } catch (error:any) {
    console.log(error)
    toast.error(error.message);
    throw error
  }
};

export const declineReqest = async (playload:ReqestPlayload) => {
  try {
    const response = await api.patch(`/instructors/decline`,playload);
    return response.data;
  } catch (error:any) {
    console.log(error)
    toast.error(error.message);
    throw error
  }
};
