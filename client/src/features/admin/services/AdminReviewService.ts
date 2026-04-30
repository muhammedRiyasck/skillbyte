import api from '@/shared/utils/AxiosInstance';
import type { AdminReviewListResult } from '../types/IAdminReview';

export interface AdminReviewFilters {
  page?: number;
  limit?: number;
  targetType?: 'course' | 'session' | 'all';
  isHidden?: boolean | 'all';
  minRating?: number;
  maxRating?: number;
  search?: string;
  sortBy?: 'createdAt' | 'rating' | 'helpfulCount';
  sortOrder?: 'asc' | 'desc';
}

export const getAdminReviews = async (
  filters: AdminReviewFilters = {},
): Promise<AdminReviewListResult> => {
  const params: Record<string, string | number | undefined> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 15,
  };

  if (filters.targetType && filters.targetType !== 'all') params.targetType = filters.targetType;
  if (filters.isHidden !== undefined && filters.isHidden !== 'all')
    params.isHidden = String(filters.isHidden);
  if (filters.minRating !== undefined) params.minRating = filters.minRating;
  if (filters.maxRating !== undefined) params.maxRating = filters.maxRating;
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.sortOrder) params.sortOrder = filters.sortOrder;

  const response = await api.get('/reviews/admin', { params });
  return response.data.data;
};

export const toggleHideReview = async (reviewId: string, hide: boolean): Promise<void> => {
  await api.patch(`/reviews/admin/${reviewId}/toggle-hide`, { hide });
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await api.delete(`/reviews/admin/${reviewId}`);
};
