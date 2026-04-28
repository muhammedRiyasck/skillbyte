import api from '@/shared/utils/AxiosInstance';
import type { ReportResponse } from '../types/IReport';

export interface ReportFilters {
  page?: number;
  limit?: number;
  status?: 'pending' | 'dismissed' | 'actioned' | 'all';
  targetType?: 'review' | 'course' | 'lesson' | 'all';
  reason?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'reason' | 'targetType';
  sortOrder?: 'asc' | 'desc';
}

export const getReports = async (filters: ReportFilters = {}): Promise<ReportResponse> => {
  const params: Record<string, string | number | undefined> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 12,
  };

  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.targetType && filters.targetType !== 'all') params.targetType = filters.targetType;
  if (filters.reason?.trim()) params.reason = filters.reason.trim();
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.sortOrder) params.sortOrder = filters.sortOrder;

  const response = await api.get('/reports/admin', { params });
  return response.data.data;
};

/** @deprecated use getReports with a status filter instead */
export const getPendingReports = async (
  page: number = 1,
  limit: number = 12,
): Promise<ReportResponse> => {
  return getReports({ page, limit, status: 'pending' });
};

export const dismissReport = async (reportId: string): Promise<void> => {
  await api.patch(`/reports/admin/${reportId}/dismiss`);
};

export const actionReport = async (reportId: string): Promise<void> => {
  await api.post(`/reports/admin/${reportId}/action`);
};
