import api from "@shared/utils/AxiosInstance";

export const initiateEnrollmentPayment = async (id: string, provider: string) => {
  const response = await api.post("/enrollment/initiate-payment", { id, provider });
  return response.data;
};

export const enrollFreeCourse = async (courseId: string) => {
  const response = await api.post("/enrollment/enroll-free", { courseId });
  return response.data;
};

export const capturePayPalPayment = async (orderId: string) => {
  const response = await api.post("/payment/capture-paypal", { orderId });
  return response.data;
};

export const checkEnrollmentStatus = async (id: string) => {
  const response = await api.get(`/enrollment/check/${id}`);
  return response.data;
};

export const getInstructorEnrollments = async (
  page: number = 1,
  limit: number = 12,
  filters: Record<string, string> = {},
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });
  const response = await api.get(`/enrollment/instructor-enrollments?${params}`);
  return response.data;
};

export const getStudentPurchases = async (page: number = 1, limit: number = 10, filters: Record<string, string> = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });
  const response = await api.get(`/payment/purchases?${params}`);
  return response.data;
};

export const getInstructorEarnings = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  filter?: string,
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
    ...(filter && filter !== 'all' ? { filter } : {}),
  });
  const response = await api.get(`/payment/earnings?${params.toString()}`);
  return response.data;
};
