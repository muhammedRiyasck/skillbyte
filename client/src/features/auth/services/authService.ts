import axiosInstance from "../../../shared/utils/AxiosInstance";
import { toast } from "sonner";

import type { singInPayload } from "../types/Auth";
import type { signUpPayload } from "../types/Auth";
import type { otpPayload } from "../types/Auth";

export const register = async (payload: signUpPayload) => {
  try {
    const response = await axiosInstance.post("/student/register", payload);
    return response.data;
  } catch (error:any) {
    toast.error(error.message);
    throw error;
  }
};

export const verifyOtp = async (payload: otpPayload)=>{
   try {
    const response = await axiosInstance.post('/student/verify-otp',payload)
    return response.data
   } catch (error:any) {
     toast.error(error.message)
     throw error(error)
   }
}

export const login = async (payload: singInPayload) => {
  try {
    const response = await axiosInstance.post("/auth/login", payload);
    return response.data;
  } catch (error) {
    toast.error("Login failed. Please check your credentials.");
    throw error;
  }
};



export const logout = async () => {
  try {
    const response = await axiosInstance.post("/auth/signout");
    return response.data;
  } catch (error) {
    toast.error("Logout failed. Please try again.");
    throw error;
  }
};



