import { toast } from "sonner"
import api from "../../../shared/utils/AxiosInstance"
import type{ Ibase } from "../types/IBase"
export const createBase = async (data:Ibase)=>{
    try {
    const response = await api.post('/course/createbase',data)
    return response.data
    } catch (error:any) {
       toast.error(error.message) 
       throw new Error(error)
    }

}
