import axios, { type AxiosError, type AxiosResponse, type AxiosRequestConfig } from "axios";
import { store } from "@core/store/Index";
import { clearUser } from "@features/auth/AuthSlice";
import { toast } from "sonner";
import type { ApiResponse } from "../types/Common";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
})
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Safety check for originalRequest existence
    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.data) {
      const errorData = error.response.data as ApiResponse;
      // Prioritize 'error' field over 'message' because backend puts specific error in 'error' field
      error.message = typeof errorData === 'string' ? errorData : errorData.error || errorData.message || 'An error occurred';
      
      // Don't show toast for 401s as they are handled by auth flow
      if (error.response.status !== 401) {
        toast.error(error.message);
      }
    }

    // Check if the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      const url = originalRequest.url || '';
      
      // Paths that should NOT trigger a refresh on 401
      // These are usually paths where 401 means "invalid credentials" or "unauthorized"
      // rather than "token expired".
      const isAuthPath = 
        url.includes('/auth/login') || 
        url.includes('/admin/login') || 
        url.includes('/auth/register') ||
        url.includes('/student/register') ||
        url.includes('/instructor/register') ||
        url.includes('/auth/verify-otp') ||
        url.includes('/auth/refresh-token')

      if (isAuthPath) {
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

    // Handle other HTTP errors
    if (typeof error.response?.status === "number" && error.response.status >= 500) {
      console.error('Server error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
