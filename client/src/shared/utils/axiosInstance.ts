import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.data?.message) {
      err.message = err.response.data.message; // Replace Axios's generic text
    }
    return Promise.reject(err);
  }
);

export default api;
