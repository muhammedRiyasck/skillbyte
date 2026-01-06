import api from "@shared/utils/AxiosInstance";

export const initiateEnrollmentPayment = async (courseId: string, provider: string) => {
  const response = await api.post("/enrollment/initiate-payment", { courseId, provider });
  return response.data;
};

export const capturePayPalPayment = async (orderId: string) => {
  const response = await api.post("/payment/capture-paypal", { orderId });
  return response.data;
};

export const checkEnrollmentStatus = async (courseId: string) => {
  const response = await api.get(`/enrollment/check/${courseId}`);
  return response.data;
};

export const getInstructorEnrollments = async (
  page: number = 1,
  limit: number = 12,
  filters: Record<string,string> = {},
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

export const getInstructorEarnings = async (page: number = 1, limit: number = 10) => {
  const response = await api.get(`/payment/earnings?page=${page}&limit=${limit}`);
  return response.data;
};
