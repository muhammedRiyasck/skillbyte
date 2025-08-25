
import { toast } from "sonner";

import axiosInstance from "../../../shared/utils/AxiosInstance";

interface loginPlayload {
    email:string;
    password:string
}

const login = async (playload:loginPlayload) => {
  try {

    const response = await axiosInstance.post("/admin/login",playload);
    return response.data;
  } catch (error:any) {
    console.log(error)
    toast.error(error.message);
    throw error
  }
};

export default login
