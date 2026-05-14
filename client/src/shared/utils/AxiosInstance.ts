import axios, { type AxiosError, type AxiosResponse } from "axios";
import { store } from "@core/store/Index";
import { clearUser } from "@features/auth/AuthSlice";
import { toast } from "sonner";
import type { ApiResponse } from "../types/Common";
import { HttpStatusCode } from "../constants/HttpStatusCode";
import { isAuthPath } from "../constants/AuthPaths";

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    _skipGlobalToast?: boolean;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 60000, // 60 second timeout for AI generation
})
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Safety check for originalRequest existence
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || '';
    const isAuth = isAuthPath(url);

    if (error.response?.data) {
      const errorData = error.response.data as ApiResponse;
      // Prioritize 'error' field then 'message'
      error.message = typeof errorData === 'string' 
        ? errorData 
        : errorData.error || errorData.message || 'An error occurred';
      
      // Handle global toast logic
      // We skip global toast for 401s generally (to avoid spamming on token expiry)
      // BUT we want to show them for explicit auth actions (like login failure)
      const skipToast = originalRequest?._skipGlobalToast || 
        (error.response.status === HttpStatusCode.UNAUTHORIZED && !isAuth);
      
      if (!skipToast) {
        toast.error(error.message);
      }
    } else if (!originalRequest?._skipGlobalToast) {
      // Handle cases with no response data (e.g., timeout, network error)
      toast.error(error.message || 'Network error occurred');
    }

    if (error.response?.status === HttpStatusCode.UNAUTHORIZED && !originalRequest?._retry) {
      if (isAuth) {
        // For auth paths, we want the 401 to propagate to the caller 
        // (to show "Invalid credentials" error) instead of attempting a refresh.
        if (url.includes('/auth/refresh-token')) {
          store.dispatch(clearUser());
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        await api.get(`/auth/refresh-token`, { 
          withCredentials: true 
        });
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed, redirecting to login", refreshError);
        store.dispatch(clearUser());
        return Promise.reject(refreshError);
      }
    }

    // Handle other HTTP errors (logging)
    if (typeof error.response?.status === "number" && error.response.status >= HttpStatusCode.INTERNAL_SERVER_ERROR) {
      console.error('Critical server error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
