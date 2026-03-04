import { useQuery } from '@tanstack/react-query'
import api from '@shared/utils/AxiosInstance'


export function useCourse(id?: string, include?: string) {

  const queryResult = useQuery({
    queryKey: ['modulesAndLesson', id, include],
    queryFn: async () => {
      const response = await api.get(`/course/details/${id}`, {
        params: { include } // e.g. 'modules,lessons'
      })
      return response?.data?.data
    },
    enabled: !!id, // Only run if id exists
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    retry: 1, // retry once on failure
  })
  return queryResult

}


