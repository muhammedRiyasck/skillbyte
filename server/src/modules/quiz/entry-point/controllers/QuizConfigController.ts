import { Request, Response } from 'express';
import { ICreateQuizConfigUseCase } from '../../application/interfaces/ICreateQuizConfigUseCase';
import { IUpdateQuizConfigUseCase } from '../../application/interfaces/IUpdateQuizConfigUseCase';
import { IGetQuizConfigUseCase } from '../../application/interfaces/IGetQuizConfigUseCase';
import { IGetQuizAnalyticsUseCase } from '../../application/interfaces/IGetQuizAnalyticsUseCase';
import { IResetStudentQuizAttemptsUseCase } from '../../application/interfaces/IResetStudentQuizAttemptsUseCase';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import {
  CreateQuizConfigRequestDto,
  UpdateQuizConfigRequestDto,
} from '../../application/dtos/QuizRequestDto';

interface IUserRequest extends Request {
  user?: {
    id: string;
    role: string;
    email?: string;
  };
}

export class QuizConfigController {
  constructor(
    private createQuizConfigUseCase: ICreateQuizConfigUseCase,
    private updateQuizConfigUseCase: IUpdateQuizConfigUseCase,
    private getQuizConfigUseCase: IGetQuizConfigUseCase,
    private getQuizAnalyticsUseCase: IGetQuizAnalyticsUseCase,
    private resetStudentAttemptsUseCase: IResetStudentQuizAttemptsUseCase,
  ) {}

  createConfig = async (req: Request, res: Response): Promise<void> => {
    const instructorId = (req as unknown as IUserRequest).user?.id;
    if (!instructorId) {
      ApiResponseHelper.unauthorized(res, 'Unauthorized');
      return;
    }

    const dto: CreateQuizConfigRequestDto = req.body;
    const configData = { ...dto, instructorId };
    const config = await this.createQuizConfigUseCase.execute(configData);

    ApiResponseHelper.created(
      res,
      'Quiz configuration created successfully',
      config,
    );
  };

  updateConfig = async (req: Request, res: Response): Promise<void> => {
    const instructorId = (req as unknown as IUserRequest).user?.id;
    const { courseId } = req.params;

    if (!instructorId) {
      ApiResponseHelper.unauthorized(res, 'Unauthorized');
      return;
    }

    const dto: UpdateQuizConfigRequestDto = req.body;
    const updatedConfig = await this.updateQuizConfigUseCase.execute(
      courseId,
      instructorId,
      dto,
    );

    ApiResponseHelper.success(
      res,
      'Quiz configuration updated successfully',
      updatedConfig,
    );
  };

  getConfig = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as unknown as IUserRequest).user?.id;
    const role = (req as unknown as IUserRequest).user?.role;
    const { courseId } = req.params;

    if (!userId || !role) {
      ApiResponseHelper.unauthorized(res, 'Unauthorized');
      return;
    }

    const config = await this.getQuizConfigUseCase.execute(
      courseId,
      userId,
      role,
    );

    ApiResponseHelper.success(
      res,
      config
        ? 'Quiz configuration retrieved successfully'
        : 'No configuration found',
      config,
    );
  };

  getAnalytics = async (req: Request, res: Response): Promise<void> => {
    const instructorId = (req as unknown as IUserRequest).user?.id;
    const { courseId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!instructorId) {
      ApiResponseHelper.unauthorized(res, 'Unauthorized');
      return;
    }

    const analytics = await this.getQuizAnalyticsUseCase.execute(
      courseId,
      instructorId,
      page,
      limit,
    );
    ApiResponseHelper.success(res, 'Quiz analytics retrieved', analytics);
  };

  resetStudentAttempts = async (req: Request, res: Response): Promise<void> => {
    const instructorId = (req as unknown as IUserRequest).user?.id;
    const { courseId, userId } = req.params;

    if (!instructorId) {
      ApiResponseHelper.unauthorized(res, 'Unauthorized');
      return;
    }

    await this.resetStudentAttemptsUseCase.execute(
      courseId,
      userId,
      instructorId,
    );
    ApiResponseHelper.success(res, 'Student attempts reset successfully');
  };
}
