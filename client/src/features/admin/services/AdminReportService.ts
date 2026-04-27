import api from '@/shared/utils/AxiosInstance';
import type { ReportResponse } from '../types/IReport';

export const getPendingReports = async (
  page: number = 1,
  limit: number = 10,
): Promise<ReportResponse> => {
  const response = await api.get('/reports/admin', {
    params: { page, limit },
  });
  return response.data.data;
};

export const dismissReport = async (reportId: string): Promise<void> => {
  await api.patch(`/reports/admin/${reportId}/dismiss`);
};

export const actionReport = async (reportId: string): Promise<void> => {
  await api.post(`/reports/admin/${reportId}/action`);
};
