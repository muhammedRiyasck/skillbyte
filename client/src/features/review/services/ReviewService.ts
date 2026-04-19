import api from '@/shared/utils/AxiosInstance';
import type {
  IReview,
  ReviewResponse,
  RatingSummary,
  SubmitReviewRequest,
  UpdateReviewRequest,
} from '../types/reviewTypes';

export const submitReview = async (
  data: SubmitReviewRequest,
): Promise<IReview> => {
  const response = await api.post('/reviews', data);
  return response.data.data.review;
};

export const updateReview = async (
  reviewId: string,
  data: UpdateReviewRequest,
): Promise<IReview> => {
  const response = await api.put(`/reviews/${reviewId}`, data);
  return response.data.data.review;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await api.delete(`/reviews/${reviewId}`);
};

export const getReviews = async (
  targetType: 'course' | 'session',
  targetId: string,
  sort: 'recent' | 'helpful' = 'recent',
  page: number = 1,
  limit: number = 10,
): Promise<ReviewResponse> => {
  const response = await api.get(`/reviews/${targetType}/${targetId}`, {
    params: { sort, page, limit },
  });
  return response.data.data;
};

export const getRatingSummary = async (
  targetType: 'course' | 'session',
  targetId: string,
): Promise<RatingSummary> => {
  const response = await api.get(`/reviews/${targetType}/${targetId}/summary`);
  return response.data.data;
};

export const toggleHelpful = async (
  reviewId: string,
): Promise<{ isHelpful: boolean }> => {
  const response = await api.post(`/reviews/${reviewId}/helpful`);
  return response.data.data;
};

export const reportReview = async (reviewId: string): Promise<void> => {
  await api.post(`/reviews/${reviewId}/report`);
};

export const getMySessionRatings = async (): Promise<Record<string, number>> => {
  const response = await api.get('/reviews/my-session-ratings');
  return response.data.data.ratings;
};
