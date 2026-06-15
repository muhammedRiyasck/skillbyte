import { Request, Response, NextFunction } from 'express';
import { ICreateQuizConfigUseCase } from '../../application/interfaces/ICreateQuizConfigUseCase';
import { IUpdateQuizConfigUseCase } from '../../application/interfaces/IUpdateQuizConfigUseCase';
import { IGetQuizConfigUseCase } from '../../application/interfaces/IGetQuizConfigUseCase';
import { IStartQuizAttemptUseCase } from '../../application/interfaces/IStartQuizAttemptUseCase';
import { ISubmitQuizAttemptUseCase } from '../../application/interfaces/ISubmitQuizAttemptUseCase';
import { IGetQuizResultUseCase } from '../../application/interfaces/IGetQuizResultUseCase';
import { IGetAllQuizAttemptsUseCase } from '../../application/interfaces/IGetAllQuizAttemptsUseCase';
import { IGetQuizAnalyticsUseCase } from '../../application/interfaces/IGetQuizAnalyticsUseCase';
import { IResetStudentQuizAttemptsUseCase } from '../../application/interfaces/IResetStudentQuizAttemptsUseCase';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import {
  CreateQuizConfigRequestDto,
  UpdateQuizConfigRequestDto,
  SubmitQuizAttemptRequestDto,
} from '../../application/dtos/QuizRequestDto';

interface IUserRequest extends Request {
  user?: {
    id: string;
    role: string;
    email?: string;
  };
}

export class QuizController {
  constructor(
    private createQuizConfigUseCase: ICreateQuizConfigUseCase,
    private updateQuizConfigUseCase: IUpdateQuizConfigUseCase,
    private getQuizConfigUseCase: IGetQuizConfigUseCase,
    private startQuizAttemptUseCase: IStartQuizAttemptUseCase,
    private submitQuizAttemptUseCase: ISubmitQuizAttemptUseCase,
    private getQuizResultUseCase: IGetQuizResultUseCase,
    private getAllQuizAttemptsUseCase: IGetAllQuizAttemptsUseCase,
    private getQuizAnalyticsUseCase: IGetQuizAnalyticsUseCase,
    private resetStudentAttemptsUseCase: IResetStudentQuizAttemptsUseCase,
  ) {}

  async createConfig(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const instructorId = (req as unknown as IUserRequest).user?.id; // Assuming auth middleware attaches user
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
    } catch (error) {
      next(error);
    }
  }

  async updateConfig(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
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
    } catch (error) {
      next(error);
    }
  }

  async getConfig(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
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
    } catch (error) {
      next(error);
    }
  }

  // Student Endpoints
  async startAttempt(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as unknown as IUserRequest).user?.id;
      const { courseId } = req.params;

      if (!userId) {
        ApiResponseHelper.unauthorized(res, 'Unauthorized');
        return;
      }

      const attempt = await this.startQuizAttemptUseCase.execute(
        courseId,
        userId,
      );
      ApiResponseHelper.created(res, 'Quiz started', attempt);
    } catch (error) {
      next(error);
    }
  }

  async submitAttempt(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as unknown as IUserRequest).user?.id;
      const { attemptId } = req.params;
      const dto: SubmitQuizAttemptRequestDto = req.body;

      if (!userId) {
        ApiResponseHelper.unauthorized(res, 'Unauthorized');
        return;
      }

      const attempt = await this.submitQuizAttemptUseCase.execute(
        attemptId,
        userId,
        dto.answers,
      );
      ApiResponseHelper.success(res, 'Quiz submitted successfully', attempt);
    } catch (error) {
      next(error);
    }
  }

  async getResult(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as unknown as IUserRequest).user?.id;
      const { courseId } = req.params;

      if (!userId) {
        ApiResponseHelper.unauthorized(res, 'Unauthorized');
        return;
      }

      const result = await this.getQuizResultUseCase.execute(courseId, userId);
      ApiResponseHelper.success(res, 'Quiz result retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  async getAllAttempts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as unknown as IUserRequest).user?.id;
      const { courseId } = req.params;

      if (!userId) {
        ApiResponseHelper.unauthorized(res, 'Unauthorized');
        return;
      }

      const attempts = await this.getAllQuizAttemptsUseCase.execute(
        courseId,
        userId,
      );
      ApiResponseHelper.success(res, 'Quiz attempts retrieved', attempts);
    } catch (error) {
      next(error);
    }
  }

  // Instructor Analytics
  async getAnalytics(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
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
    } catch (error) {
      next(error);
    }
  }

  async resetStudentAttempts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
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
    } catch (error) {
      next(error);
    }
  }
}
