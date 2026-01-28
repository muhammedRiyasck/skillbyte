import api from "@shared/utils/AxiosInstance";

import type {
  IresetPassword,
  IsingInPayload,
  IStudentSignUpPayload,
  IinstrctorSignUpPayload,
  IforgotPassword,
  IotpPayload,
} from "../types/Auth";

export const studentRegister = async (payload: IStudentSignUpPayload) => {
  const response = await api.post("/student/register", payload);
  return response.data;
};

export const studentVerifyOtp = async (payload: IotpPayload) => {
  const response = await api.post("/student/verify-otp", payload);
  return response.data;
};

export const instructorRegister = async (payload: IinstrctorSignUpPayload) => {
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
};

export const reapplyInstructor = async (payload: IinstrctorSignUpPayload) => {
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
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const forgotPassword = async (playload: IforgotPassword) => {
  const response = await api.post("/auth/forgot-password", playload);
  return response.data;
};

export const resetPassword = async (playload: IresetPassword) => {
  const response = await api.post("/auth/reset-password", playload);
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};
