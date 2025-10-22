import axios, { type AxiosError, type AxiosResponse, type AxiosRequestConfig } from "axios";
import { store } from "@core/store/Index";
import { clearUser } from "@features/auth/AuthSlice";
import type { ApiResponse } from "../types/Common";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging and adding auth headers
api.interceptors.request.use(
  (config) => {
    // Add any request modifications here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Extract error message from response
    if (error.response?.data) {
      const errorData = error.response.data as ApiResponse;
      error.message = typeof errorData ==='string' ?errorData : errorData.message || errorData.error || 'An error occurred';
    }

    // Handle 401 Unauthorized - token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.get(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, { 
          withCredentials: true 
        });
        return api(originalRequest); // Retry original request
      } catch {
        console.error("Token refresh failed, redirecting to login");
        store.dispatch(clearUser());
        // Optionally redirect to login page
        // window.location.href = '/auth';
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
