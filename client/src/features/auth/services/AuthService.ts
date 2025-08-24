import axiosInstance from "../../../shared/utils/AxiosInstance";
import { toast } from "sonner";

import type { IresetPassword, IsingInPayload,IStudentSignUpPayload,IinstrctorSignUpPayload,IforgotPassword,IotpPayload} from "../types/Auth";

export const studentRegister = async (payload: IStudentSignUpPayload) => {
  try {
    const response = await axiosInstance.post("/student/register", payload);
    return response.data;
  } catch (error:any) {
    toast.error(error.message);
    throw error;
  }
};

export const studentVerifyOtp = async (payload: IotpPayload)=>{
  //  try {
    const response = await axiosInstance.post('/student/verify-otp',payload)
    return response.data
  //  } catch (error:any) {
  //   console.log(error)
  //    toast.error(error.message)
  //    throw error(error)
  //  }
}

export const instructorRegister = async (payload: IinstrctorSignUpPayload) => {
  try {
    const response = await axiosInstance.post("/instructor/register", payload);
    return response.data;
  } catch (error:any) {
    toast.error(error.message);
    throw error;
  }
};


export const instructorVerifyOtp = async (payload: IotpPayload)=>{
  // try {
    const response = await axiosInstance.post('/instructor/verify-otp',payload)
    return response.data
  // } catch (error:any) {
  //    console.log(error)
  //    toast.error(error.message)
  //    throw error(error)
  //  }
  }

export const resendOtp = async(email:string)=>{
  // try {
    const response = await axiosInstance.post('/auth/resend-otp',{email})
    return response.data
    
  // } catch (error:any) {
  //   toast.error(error.message)
  //   throw error(error)
  // }
}

export const login = async (payload: IsingInPayload) => {
  try {
    const response = await axiosInstance.post("/auth/login", payload);
    return response.data;
  } catch (error:any) {
    
    toast.error(error.message);
    throw error(error)
  }
};

export const forgotPassword = async(playload:IforgotPassword)=>{
  try {
    const response = await axiosInstance.post('/auth/forgot-password',playload)
    return response.data  
  } catch (error:any) {
    toast.error(error.message)
    throw error(error)
  }
}

export const resetPassword  = async(playload:IresetPassword)=>{
  try {
    const response = await axiosInstance.post('/auth/reset-password',playload)
    return response.data  
  } catch (error:any) {
    toast.error(error.message)
    throw error(error)
  }

}

export const logout = async () => {
  try {

    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  } catch (error:any) {
  
    toast.error("Logout failed. Please try again.");
    throw error
  }
};



