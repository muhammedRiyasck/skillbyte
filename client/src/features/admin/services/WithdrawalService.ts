import api from "@shared/utils/AxiosInstance";

export const getAllWithdrawals = async (options: { status?: string, page?: number, limit?: number, search?: string }) => {
    const { status, page = 1, limit = 10, search = '' } = options;
    const params = new URLSearchParams();
    if (status && status.toLowerCase() !== 'all') params.append('status', status);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (search) params.append('search', search);

    const response = await api.get(`/payment/withdrawals/all?${params.toString()}`);
    return response.data;
};

export const processWithdrawal = async (withdrawalId: string, adminNotes?: string) => {
    const response = await api.post(`/payment/withdrawals/${withdrawalId}/process`, { adminNotes });
    return response.data;
};

export const rejectWithdrawal = async (withdrawalId: string, adminNotes: string) => {
    const response = await api.post(`/payment/withdrawals/${withdrawalId}/reject`, { adminNotes });
    return response.data;
};
