import api from "@shared/utils/AxiosInstance";

export const getAdminDashboardData = async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
};
