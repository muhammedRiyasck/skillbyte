import api from "@shared/utils/AxiosInstance";

export const getDashboardEarnings = async () => {
    const response = await api.get(`/payment/earnings?page=1&limit=5`);
    return response.data;
};

export const getDashboardEnrollments = async () => {
    const response = await api.get(`/enrollment/instructor-enrollments?page=1&limit=100`);
    return response.data;
};

export const getDashboardBookings = async () => {
    const response = await api.get(`/mentorship/bookings/instructor?limit=5`);
    return response.data;
};
