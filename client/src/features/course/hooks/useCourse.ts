import { useQuery } from '@tanstack/react-query'
import api from '@shared/utils/AxiosInstance'


export function useCourse(courseId?: string, include?: string) {

  const queryResult = useQuery({
    queryKey: ['modulesAndLesson', courseId, include],
    queryFn: async () => {
      const response = await api.get(`/course/details/${courseId}`, {
        params: { include } // e.g. 'modules,lessons'
      })
      return response?.data?.data?.modules
    },
    enabled: !!courseId, // Only run if courseId exists
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    retry: 1, // retry once on failure
  })
  return queryResult
  
}


