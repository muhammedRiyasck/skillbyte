import api from "@shared/utils/AxiosInstance";

export const getDashboardEarnings = async () => {
    const response = await api.get(`/payment/earnings?page=1&limit=5&trendDays=30`);
    return response.data?.data;
};

export const getDashboardEnrollments = async () => {
    const response = await api.get(`/enrollment/instructor-enrollments?page=1&limit=100`);
    return response.data?.data;
};

export const getDashboardCourses = async () => {
    const response = await api.get(`/course/instructor-courses?page=1&limit=100`);
    return response.data?.data;
};

export const getDashboardBookings = async () => {
    const response = await api.get(`/mentorship/bookings/instructor?upcoming=true`);
    return response.data?.data; // { bookings: BookingResponseDto[] }
};

export const getInstructorProfile = async () => {
    const response = await api.get(`/instructor/profile`);
    return response.data?.data?.instructor;
};

export const createStripeOnboardingLink = async () => {
    const response = await api.post(`/instructor/stripe-onboarding`);
    return response.data;
};

export const getMyWithdrawals = async (page: number = 1, limit: number = 5) => {
    const response = await api.get(`/payment/withdrawals/my?page=${page}&limit=${limit}`);
    return response.data?.data; // { data: WithdrawalResponseDto[], pagination }
};

export const requestWithdrawal = async (amount: number) => {
    // Server Zod schema (RequestWithdrawalSchema) requires payoutMethod: 'STRIPE'
    const response = await api.post(`/payment/withdrawals/request`, { amount, payoutMethod: 'STRIPE' });
    return response.data;
};

export const syncStripeStatus = async () => {
    const response = await api.post(`/instructor/sync-stripe-status`);
    return response.data;
};
