import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.data?.message|| err.response?.data?.error) {
      err.message = err.response.data.message || err.response.data.error ; // Replace Axios's generic text
    }
    return Promise.reject(err);
  }
);

export default api;
