
import { toast } from "sonner";

import api from "@shared/utils/AxiosInstance";

interface loginPlayload {
    email:string;
    password:string
}

const login = async (playload:loginPlayload) => {
  try {

    const response = await api.post("/admin/login",playload);
    return response.data;
  } catch (error) {
    console.log(error)
    toast.error((error as Error).message);
    throw error
  }
};

export default login
