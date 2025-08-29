import { toast } from "sonner"
import api from "./AxiosInstance"

type SetState<T> = React.Dispatch<React.SetStateAction<T>>

const fetchData = async <T>(
  endPoint: string,
  setState: SetState<T>,
  setLoading: SetState<boolean>
): Promise<void> => {
  try {
    const response = await api.get(endPoint)
    console.log(response)
    setState(response.data)
  } catch (error: any) {
    console.log(error.message, 'error from fetch data function')
    toast.error(error.message)
  } finally{
    setLoading(false)
  }
}

export default fetchData
