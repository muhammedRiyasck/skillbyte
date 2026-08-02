import api from "@shared/utils/AxiosInstance";

export const getAdminDashboardData = async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
};

export const getRevenueTrendByYear = async (year: number) => {
    const response = await api.get(`/admin/dashboard/revenue-trend?year=${year}`);
    return response.data;
};
