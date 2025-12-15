import api from "@shared/utils/AxiosInstance";
import { toast } from "sonner";

import type {
  IresetPassword,
  IsingInPayload,
  IStudentSignUpPayload,
  IinstrctorSignUpPayload,
  IforgotPassword,
  IotpPayload,
} from "../types/Auth";

export const studentRegister = async (payload: IStudentSignUpPayload) => {
  try {
    const response = await api.post("/student/register", payload);
    return response.data;
  } catch (error) {
    toast.error((error as Error).message);
    throw error;
  }
};

export const studentVerifyOtp = async (payload: IotpPayload) => {
  const response = await api.post("/student/verify-otp", payload);
  return response.data;
};

export const instructorRegister = async (payload: IinstrctorSignUpPayload) => {
  try {
    const formData = new FormData();

    // Append all fields to FormData
    Object.entries(payload).forEach(([key, value]) => {
      if (key === "resume" && value instanceof File) {
        formData.append("resume", value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const response = await api.post("/instructor/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    toast.error((error as Error).message);
    throw error;
  }
};

export const reapplyInstructor = async (payload: IinstrctorSignUpPayload) => {
  try {
    const formData = new FormData();

    // Append all fields to FormData
    Object.entries(payload).forEach(([key, value]) => {
      if (key === "resume" && value instanceof File) {
        formData.append("resume", value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const response = await api.put("/instructor/reapply", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    toast.error('errr reapply failed');
    throw error;
  }
};

export const instructorVerifyOtp = async (payload: IotpPayload) => {
  const response = await api.post("/instructor/verify-otp", payload);
  return response.data;
};

export const resendOtp = async (email: string) => {
  const response = await api.post("/auth/resend-otp", { email });
  return response.data;
};

export const login = async (payload: IsingInPayload) => {
  try {
    const response = await api.post("/auth/login", payload);
    return response.data;
  } catch (error) {
    console.log(error);
    toast.error((error as Error).message);
    throw error;
  }
};

export const forgotPassword = async (playload: IforgotPassword) => {
  try {
    const response = await api.post("/auth/forgot-password", playload);
    return response.data;
  } catch (error) {
    toast.error((error as Error).message);
    throw error;
  }
};

export const resetPassword = async (playload: IresetPassword) => {
  try {
    const response = await api.post("/auth/reset-password", playload);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("An error occurred");
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    toast.error("Logout failed. Please try again.");
    throw error;
  }
};
