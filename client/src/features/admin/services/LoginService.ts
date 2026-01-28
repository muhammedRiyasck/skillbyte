
import api from "@shared/utils/AxiosInstance";

interface loginPlayload {
    email:string;
    password:string
}

const login = async (playload:loginPlayload) => {
  const response = await api.post("/admin/login",playload);
  return response.data;
};

export default login
