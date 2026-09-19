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
  const resumeFile = payload.resume instanceof File ? payload.resume : null;

  // Build JSON payload (no file) — include the resume content type so the
  // server can generate a correctly typed pre-signed upload URL
  const jsonPayload: Record<string, unknown> = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (key !== "resume" && value !== null && value !== undefined) {
      jsonPayload[key] = value;
    }
  });
  if (resumeFile) {
    jsonPayload["resumeContentType"] = resumeFile.type || "application/pdf";
  }

  // Step 1: Send form data as JSON — server sends OTP and returns a pre-signed upload URL
  const response = await api.post("/instructor/register", jsonPayload);
  const { uploadUrl, resumeKey } = response.data?.data ?? {};

  // Step 2: Upload resume directly to S3 using the pre-signed URL (no server involved)
  // This is a write-only PUT — the URL cannot be used to read or list any files
  if (resumeFile && uploadUrl) {
    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": resumeFile.type || "application/pdf" },
      body: resumeFile,
    });
  }

  // Step 3: Store resumeKey in sessionStorage for the OTP verify step
  if (resumeKey) {
    sessionStorage.setItem("resumeKey", resumeKey);
  }

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
  // Include the resumeKey so the server can validate the upload and save the S3 key
  const resumeKey = sessionStorage.getItem("resumeKey");
  const response = await api.post("/instructor/verify-otp", {
    ...payload,
    ...(resumeKey ? { resumeKey } : {}),
  });
  // Clean up after successful verification
  sessionStorage.removeItem("resumeKey");
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
