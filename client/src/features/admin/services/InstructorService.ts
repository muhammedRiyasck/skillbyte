

import { toast } from "sonner";

import api from "@shared/utils/AxiosInstance";
import type{IReqestPlayload} from '../types/IReqestPlayload'

export const approveRequest = async (playload:IReqestPlayload) => {
  try {
    const response = await api.patch(`/instructors/approve`,playload);
    return response.data;
  } catch (error:any) {
    console.log(error)
    toast.error(error.message);
    throw error
  }
};

export const declineRequest = async (playload:IReqestPlayload) => {
  try {
    const response = await api.patch(`/instructors/decline`,playload);
    return response.data;
  } catch (error:any) {
    console.log(error)
    toast.error(error.message);
    throw error
  }
};

export const changeInstructorStatusRequest = async (playload:IReqestPlayload) => {
  console.log('changeInstructorStatusRequest called',playload)
  try {
    const response = await api.patch(`instructors/${playload.instructorId}/status`,playload);
    return response.data;
  }
  catch (error:any) {
    console.log(error)
    toast.error(error.message);
    throw error
  }
};


