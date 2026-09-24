import { Request, Response } from 'express';
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
import { SubmitReviewRequestDto } from '../../application/dtos/SubmitReviewRequestDto';
import { UpdateReviewRequestDto } from '../../application/dtos/UpdateReviewRequestDto';

/** Handles HTTP requests for review operations. */
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
  ) {}

  /**
   * Submit review for the Review entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  submitReview = async (req: Request, res: Response): Promise<void> => {
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
  };

  /**
   * Update review for the Review entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  updateReview = async (req: Request, res: Response): Promise<void> => {
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
  };

  /**
   * Delete review for the Review entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  deleteReview = async (req: Request, res: Response): Promise<void> => {
    const studentId = (req as AuthenticatedRequest).user.id;
    const { reviewId } = req.params;
    await this.deleteReviewUseCase.execute(studentId, reviewId);
    ApiResponseHelper.success(res, 'Review deleted successfully');
  };

  /**
   * Get reviews for the Review entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  getReviews = async (req: Request, res: Response): Promise<void> => {
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
  };

  /**
   * Get rating summary for the Review entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  getRatingSummary = async (req: Request, res: Response): Promise<void> => {
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

  /**
   * Toggle helpful for the Review entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  toggleHelpful = async (req: Request, res: Response): Promise<void> => {
    const studentId = (req as AuthenticatedRequest).user.id;
    const { reviewId } = req.params;
    const isHelpful = await this.toggleHelpfulReviewUseCase.execute(
      reviewId,
      studentId,
    );
    ApiResponseHelper.success(res, 'Helpful toggle updated', { isHelpful });
  };

  /**
   * Report review for the Review entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  reportReview = async (req: Request, res: Response): Promise<void> => {
    const { reviewId } = req.params;
    await this.reportReviewUseCase.execute(reviewId);
    ApiResponseHelper.success(res, 'Review reported successfully');
  };

  /**
   * Get my session ratings for the Review entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  getMySessionRatings = async (req: Request, res: Response): Promise<void> => {
    const studentId = (req as AuthenticatedRequest).user.id;
    const ratings = await this.getMySessionRatingsUseCase.execute(studentId);
    ApiResponseHelper.success(res, 'Ratings retrieved successfully', {
      ratings,
    });
  };
}
