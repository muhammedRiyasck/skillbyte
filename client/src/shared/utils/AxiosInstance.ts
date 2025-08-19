import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.data?.message|| error.response?.data?.error) {
      error.message = error.response.data.message || error.response.data.error ; // Replace Axios's generic text
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.get("http://localhost:4000/api/auth/refresh-token", { withCredentials: true });
        return api(originalRequest); // retry original request after new cookie is set
      } catch (err) {
        console.error("Refresh failed, redirecting to login");
        // e.g., redirect to /login
      }
    }

    return Promise.reject(error);
  }
);

