import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { IReplyToReviewUseCase } from '../../application/interfaces/IReplyToReviewUseCase';
import { IGetInstructorReviewsUseCase } from '../../application/interfaces/IGetInstructorReviewsUseCase';

/** Handles HTTP requests for instructor review operations. */
export class InstructorReviewController {
  constructor(
    private replyToReviewUseCase: IReplyToReviewUseCase,
    private getInstructorReviewsUseCase: IGetInstructorReviewsUseCase,
  ) {}

  /**
   * Get instructor reviews for the InstructorReview entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  getInstructorReviews = async (req: Request, res: Response): Promise<void> => {
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

    ApiResponseHelper.success(
      res,
      'Instructor reviews retrieved successfully',
      { reviews, total },
    );
  };

  /**
   * Reply to review for the InstructorReview entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  replyToReview = async (req: Request, res: Response): Promise<void> => {
    const instructorId = (req as AuthenticatedRequest).user.id;
    const { reviewId } = req.params;
    const { reply } = req.body as { reply: string };
    const replyText = reply && typeof reply === 'string' ? reply.trim() : '';

    await this.replyToReviewUseCase.execute(instructorId, reviewId, replyText);
    ApiResponseHelper.success(res, 'Reply added successfully');
  };
}
