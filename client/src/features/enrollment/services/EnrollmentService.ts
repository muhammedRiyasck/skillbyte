import api from "@shared/utils/AxiosInstance";

export const createPaymentIntent = async (courseId: string) => {
  const response = await api.post("/enrollment/create-payment-intent", { courseId });
  return response.data;
};

export const checkEnrollmentStatus = async (courseId: string) => {
  const response = await api.get(`/enrollment/check/${courseId}`);
  return response.data;
};

export const getInstructorEnrollments = async (page: number = 1, limit: number = 10) => {
  const response = await api.get(`/enrollment/instructor-enrollments?page=${page}&limit=${limit}`);
  return response.data;
};
