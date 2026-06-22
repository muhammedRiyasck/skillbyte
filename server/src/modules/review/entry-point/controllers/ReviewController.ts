import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { ISubmitReviewUseCase } from '../../application/interfaces/ISubmitReviewUseCase';
import { IUpdateReviewUseCase } from '../../application/interfaces/IUpdateReviewUseCase';
import { IDeleteReviewUseCase } from '../../application/interfaces/IDeleteReviewUseCase';
import { IGetReviewsUseCase } from '../../application/interfaces/IGetReviewsUseCase';
import { IToggleHelpfulReviewUseCase } from '../../application/interfaces/IToggleHelpfulReviewUseCase';
import { IGetCourseRatingSummaryUseCase } from '../../application/interfaces/IGetCourseRatingSummaryUseCase';
import { IReportReviewUseCase } from '../../application/interfaces/IReportReviewUseCase';
import { IGetMySessionRatingsUseCase } from '../../application/interfaces/IGetMySessionRatingsUseCase';
import { IGetAllReviewsAdminUseCase } from '../../application/interfaces/IGetAllReviewsAdminUseCase';
import { IAdminToggleHideReviewUseCase } from '../../application/interfaces/IAdminToggleHideReviewUseCase';
import { IAdminDeleteReviewUseCase } from '../../application/interfaces/IAdminDeleteReviewUseCase';
import { IReplyToReviewUseCase } from '../../application/interfaces/IReplyToReviewUseCase';
import { IGetInstructorReviewsUseCase } from '../../application/interfaces/IGetInstructorReviewsUseCase';
import { ReviewMapper } from '../../application/mappers/ReviewMapper';
import { SubmitReviewRequestDto } from '../../application/dtos/SubmitReviewRequestDto';
import { UpdateReviewRequestDto } from '../../application/dtos/UpdateReviewRequestDto';

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
    private replyToReviewUseCase: IReplyToReviewUseCase,
    private getInstructorReviewsUseCase: IGetInstructorReviewsUseCase,
  ) {}

  submitReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const studentId = (req as AuthenticatedRequest).user.id;
      const { targetType, targetId, rating, comment } =
        req.body as SubmitReviewRequestDto;

      const review = await this.submitReviewUseCase.execute(
        studentId,
        targetType,
        targetId,
        rating,
        comment,
      );

      ApiResponseHelper.created(res, 'Review submitted successfully', {
        review,
      });
    } catch (error) {
      next(error);
    }
  };

  updateReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const studentId = (req as AuthenticatedRequest).user.id;
      const { reviewId } = req.params;
      const { rating, comment } = req.body as UpdateReviewRequestDto;

      const review = await this.updateReviewUseCase.execute(
        studentId,
        reviewId,
        rating,
        comment,
      );

      ApiResponseHelper.success(res, 'Review updated successfully', { review });
    } catch (error) {
      next(error);
    }
  };

  deleteReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const studentId = (req as AuthenticatedRequest).user.id;
      const { reviewId } = req.params;
      await this.deleteReviewUseCase.execute(studentId, reviewId);
      ApiResponseHelper.success(res, 'Review deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  getReviews = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const currentUserId = (req as AuthenticatedRequest).user?.id;
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
    } catch (error) {
      next(error);
    }
  };

  getRatingSummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
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
    } catch (error) {
      next(error);
    }
  };

  toggleHelpful = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const studentId = (req as AuthenticatedRequest).user.id;
      const { reviewId } = req.params;
      const isHelpful = await this.toggleHelpfulReviewUseCase.execute(
        reviewId,
        studentId,
      );
      ApiResponseHelper.success(res, 'Helpful toggle updated', { isHelpful });
    } catch (error) {
      next(error);
    }
  };

  reportReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { reviewId } = req.params;
      await this.reportReviewUseCase.execute(reviewId);
      ApiResponseHelper.success(res, 'Review reported successfully');
    } catch (error) {
      next(error);
    }
  };

  getMySessionRatings = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const studentId = (req as AuthenticatedRequest).user.id;
      const ratings = await this.getMySessionRatingsUseCase.execute(studentId);
      ApiResponseHelper.success(res, 'Ratings retrieved successfully', {
        ratings,
      });
    } catch (error) {
      next(error);
    }
  };

  // ── Instructor handlers ────────────────────────────────────────────────────

  getInstructorReviews = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const instructorId = (req as AuthenticatedRequest).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters = {
        targetType: (req.query.targetType as string) || undefined,
        rating: req.query.rating
          ? parseInt(req.query.rating as string)
          : undefined,
        hasReply:
          req.query.status === 'replied'
            ? true
            : req.query.status === 'pending'
              ? false
              : undefined,
        sortBy: (req.query.sortBy as 'createdAt' | 'rating') || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const { reviews, total } = await this.getInstructorReviewsUseCase.execute(
        instructorId,
        filters,
        page,
        limit,
      );

      const mappedReviews = reviews.map((r) =>
        ReviewMapper.toDto(r, r.studentInfo),
      );

      ApiResponseHelper.success(
        res,
        'Instructor reviews retrieved successfully',
        { reviews: mappedReviews, total },
      );
    } catch (error) {
      next(error);
    }
  };

  replyToReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const instructorId = (req as AuthenticatedRequest).user.id;
      const { reviewId } = req.params;
      const { reply } = req.body as { reply: string };
      const replyText = reply && typeof reply === 'string' ? reply.trim() : '';

      await this.replyToReviewUseCase.execute(
        instructorId,
        reviewId,
        replyText,
      );
      ApiResponseHelper.success(res, 'Reply added successfully');
    } catch (error) {
      next(error);
    }
  };

  // ── Admin-only handlers ────────────────────────────────────────────────────

  getAllReviewsAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 15;
      const {
        targetType,
        isHidden,
        minRating,
        maxRating,
        search,
        sortBy,
        sortOrder,
      } = req.query;

      const filters = {
        targetType: (targetType as 'course' | 'session') || undefined,
        isHidden:
          isHidden === 'true' ? true : isHidden === 'false' ? false : undefined,
        minRating: minRating ? parseInt(minRating as string) : undefined,
        maxRating: maxRating ? parseInt(maxRating as string) : undefined,
        search: (search as string) || undefined,
        sortBy:
          (sortBy as 'createdAt' | 'rating' | 'helpfulCount') || 'createdAt',
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await this.getAllReviewsAdminUseCase.execute(
        filters,
        page,
        limit,
      );
      ApiResponseHelper.success(res, 'Reviews retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  };

  adminToggleHideReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { reviewId } = req.params;
      const { hide } = req.body as { hide: boolean };
      await this.adminToggleHideReviewUseCase.execute(reviewId, hide);
      ApiResponseHelper.success(
        res,
        `Review ${hide ? 'hidden' : 'unhidden'} successfully`,
      );
    } catch (error) {
      next(error);
    }
  };

  adminDeleteReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { reviewId } = req.params;
      await this.adminDeleteReviewUseCase.execute(reviewId);
      ApiResponseHelper.success(res, 'Review permanently deleted');
    } catch (error) {
      next(error);
    }
  };
}
