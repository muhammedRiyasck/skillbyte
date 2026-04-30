import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';

import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { z } from 'zod';
import { ISubmitReviewUseCase } from '../../application/interfaces/ISubmitReviewUseCase';
import { IUpdateReviewUseCase } from '../../application/interfaces/IUpdateReviewUseCase';
import { IDeleteReviewUseCase } from '../../application/interfaces/IDeleteReviewUseCase';
import { IGetReviewsUseCase } from '../../application/interfaces/IGetReviewsUseCase';
import { IToggleHelpfulReviewUseCase } from '../../application/interfaces/IToggleHelpfulReviewUseCase';
import { IGetCourseRatingSummaryUseCase } from '../../application/interfaces/IGetCourseRatingSummaryUseCase';
import { IReportReviewUseCase } from '../../application/interfaces/IReportReviewUseCase';
import { IGetMySessionRatingsUseCase } from '../../application/interfaces/IGetMySessionRatingsUseCase';
import { IGetAllReviewsAdminUseCase } from '../../application/interfaces/IGetAllReviewsAdminUseCase';
import { IAdminToggleHideReviewUseCase } from '../../application/use-cases/AdminToggleHideReviewUseCase';
import { IAdminDeleteReviewUseCase } from '../../application/use-cases/AdminDeleteReviewUseCase';

const SubmitReviewSchema = z.object({
  targetType: z.enum(['course', 'session']),
  targetId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional().default(''),
});

const UpdateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export class ReviewController {
  constructor(
    private submitReviewUseCase: ISubmitReviewUseCase,
    private updateReviewUseCase: IUpdateReviewUseCase,
    private deleteReviewUseCase: IDeleteReviewUseCase,
    private getReviewsUseCase: IGetReviewsUseCase,
    private getCourseRatingSummaryUseCase: IGetCourseRatingSummaryUseCase,
    private toggleHelpfulReviewUseCase: IToggleHelpfulReviewUseCase,
    private reportReviewUseCase: IReportReviewUseCase,
    private getMySessionRatingsUseCase: IGetMySessionRatingsUseCase,
    private getAllReviewsAdminUseCase: IGetAllReviewsAdminUseCase,
    private adminToggleHideReviewUseCase: IAdminToggleHideReviewUseCase,
    private adminDeleteReviewUseCase: IAdminDeleteReviewUseCase,
  ) {}

  submitReview = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const studentId = authReq.user.id;
    const { targetType, targetId, rating, comment } = SubmitReviewSchema.parse(
      req.body,
    );

    const review = await this.submitReviewUseCase.execute(
      studentId,
      targetType,
      targetId,
      rating,
      comment,
    );

    ApiResponseHelper.created(res, 'Review submitted successfully', { review });
  };

  updateReview = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const studentId = authReq.user.id;
    const { reviewId } = req.params;
    const { rating, comment } = UpdateReviewSchema.parse(req.body);

    const review = await this.updateReviewUseCase.execute(
      studentId,
      reviewId,
      rating,
      comment,
    );

    ApiResponseHelper.success(res, 'Review updated successfully', { review });
  };

  deleteReview = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const studentId = authReq.user.id;
    const { reviewId } = req.params;

    await this.deleteReviewUseCase.execute(studentId, reviewId);

    ApiResponseHelper.success(res, 'Review deleted successfully');
  };

  getReviews = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    // Current user can be any role for fetching reviews, allowing logged out users could be an option if auth is optional.
    // Assuming auth is required.
    const currentUserId = authReq.user?.id;
    const { targetType, targetId } = req.params;
    const sort = (req.query.sort as 'recent' | 'helpful') || 'recent';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await this.getReviewsUseCase.execute(
      targetType,
      targetId,
      currentUserId,
      sort,
      page,
      limit,
    );

    ApiResponseHelper.success(res, 'Reviews retrieved successfully', data);
  };

  getRatingSummary = async (req: Request, res: Response) => {
    const { targetType, targetId } = req.params;

    const summary = await this.getCourseRatingSummaryUseCase.execute(
      targetType,
      targetId,
    );

    ApiResponseHelper.success(
      res,
      'Rating summary retrieved successfully',
      summary,
    );
  };

  toggleHelpful = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const studentId = authReq.user.id;
    const { reviewId } = req.params;

    const isHelpful = await this.toggleHelpfulReviewUseCase.execute(
      reviewId,
      studentId,
    );

    ApiResponseHelper.success(res, 'Helpful toggle updated', { isHelpful });
  };

  reportReview = async (req: Request, res: Response) => {
    const { reviewId } = req.params;

    await this.reportReviewUseCase.execute(reviewId);

    ApiResponseHelper.success(res, 'Review reported successfully');
  };

  getMySessionRatings = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const studentId = authReq.user.id;

    const ratings = await this.getMySessionRatingsUseCase.execute(studentId);

    ApiResponseHelper.success(res, 'Ratings retrieved successfully', {
      ratings,
    });
  };

  // ── Admin-only handlers ────────────────────────────────────────────────────

  getAllReviewsAdmin = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const { targetType, isHidden, minRating, maxRating, search, sortBy, sortOrder } = req.query;

    const filters = {
      targetType: (targetType as 'course' | 'session') || undefined,
      isHidden: isHidden === 'true' ? true : isHidden === 'false' ? false : undefined,
      minRating: minRating ? parseInt(minRating as string) : undefined,
      maxRating: maxRating ? parseInt(maxRating as string) : undefined,
      search: (search as string) || undefined,
      sortBy: (sortBy as 'createdAt' | 'rating' | 'helpfulCount') || 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await this.getAllReviewsAdminUseCase.execute(filters, page, limit);

    ApiResponseHelper.success(res, 'Reviews retrieved successfully', result);
  };

  adminToggleHideReview = async (req: Request, res: Response) => {
    const { reviewId } = req.params;
    const { hide } = req.body as { hide: boolean };

    await this.adminToggleHideReviewUseCase.execute(reviewId, hide);

    ApiResponseHelper.success(res, `Review ${hide ? 'hidden' : 'unhidden'} successfully`);
  };

  adminDeleteReview = async (req: Request, res: Response) => {
    const { reviewId } = req.params;
    await this.adminDeleteReviewUseCase.execute(reviewId);
    ApiResponseHelper.success(res, 'Review permanently deleted');
  };
}
