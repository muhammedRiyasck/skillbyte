import api from "@shared/utils/AxiosInstance";

export const createPaymentIntent = async (courseId: string) => {
  try {
    const response = await api.post("/enrollment/create-payment-intent", { courseId });
    return response.data;
  } catch (error) {
    throw error;
  }
};
