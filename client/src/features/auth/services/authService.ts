import axiosInstance from "../../../shared/utils/axiosInstance";
import { toast } from "sonner";

import type { singInPayload } from "../types/auth";
import type { signUpPayload } from "../types/auth";

export const signIn = async (payload: singInPayload) => {
  try {
    const response = await axiosInstance.post("/auth/signin", payload);
    return response.data;
  } catch (error) {
    toast.error("Login failed. Please check your credentials.");
    throw error;
  }
};

export const googleSignIn = async () => {
  try {
    const response = await axiosInstance.get("/auth/google");
    return response.data;
  } catch (error) {
    toast.error("Google login failed. Please try again.");
    throw error;
  }
}

export const signUp = async (payload: signUpPayload) => {
  try {
    const response = await axiosInstance.post("/auth/signup", payload);
    return response.data;
  } catch (error) {
    toast.error("Registration failed. Please check your details.");
    throw error;
  }
};

export const signOut = async () => {
  try {
    const response = await axiosInstance.post("/auth/signout");
    return response.data;
  } catch (error) {
    toast.error("Logout failed. Please try again.");
    throw error;
  }
};



