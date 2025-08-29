import axios from "axios";
import { store } from "../../core/store/Index";
import { clearUser } from "../../features/auth/AuthSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.data?.message|| error.response?.data?.error || error.response?.data) {
      error.message =  error.response.data.message || error.response.data.error ||error.response?.data; // Replace Axios's generic text
    }
    console.log(error.response,'from intercepter')
    if (error.response?.status === 401 && !originalRequest._retry) {
   
      originalRequest._retry = true;

      try {
        await axios.get("http://localhost:4000/api/auth/refresh-token", { withCredentials: true });
        return api(originalRequest); // retry original request after new cookie is set
      } catch (err) {

        console.log("Refresh failed, redirecting to login");
         store.dispatch(clearUser());
        //  window.location.href='/auth'
      }
    }

    return Promise.reject(error);
  }
);

export default api
