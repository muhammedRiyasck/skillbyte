import { Request, Response } from 'express';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { IGetAllReviewsAdminUseCase } from '../../application/interfaces/IGetAllReviewsAdminUseCase';
import { IAdminToggleHideReviewUseCase } from '../../application/interfaces/IAdminToggleHideReviewUseCase';
import { IAdminDeleteReviewUseCase } from '../../application/interfaces/IAdminDeleteReviewUseCase';

export class AdminReviewController {
  constructor(
    private getAllReviewsAdminUseCase: IGetAllReviewsAdminUseCase,
    private adminToggleHideReviewUseCase: IAdminToggleHideReviewUseCase,
    private adminDeleteReviewUseCase: IAdminDeleteReviewUseCase,
  ) {}

  getAllReviewsAdmin = async (req: Request, res: Response): Promise<void> => {
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
  };

  adminToggleHideReview = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const { reviewId } = req.params;
    const { hide } = req.body as { hide: boolean };
    await this.adminToggleHideReviewUseCase.execute(reviewId, hide);
    ApiResponseHelper.success(
      res,
      `Review ${hide ? 'hidden' : 'unhidden'} successfully`,
    );
  };

  adminDeleteReview = async (req: Request, res: Response): Promise<void> => {
    const { reviewId } = req.params;
    await this.adminDeleteReviewUseCase.execute(reviewId);
    ApiResponseHelper.success(res, 'Review permanently deleted');
  };
}
