import { Request, Response } from 'express';
import { IStartQuizAttemptUseCase } from '../../application/interfaces/IStartQuizAttemptUseCase';
import { ISubmitQuizAttemptUseCase } from '../../application/interfaces/ISubmitQuizAttemptUseCase';
import { IGetQuizResultUseCase } from '../../application/interfaces/IGetQuizResultUseCase';
import { IGetAllQuizAttemptsUseCase } from '../../application/interfaces/IGetAllQuizAttemptsUseCase';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { SubmitQuizAttemptRequestDto } from '../../application/dtos/QuizRequestDto';

interface IUserRequest extends Request {
  user?: {
    id: string;
    role: string;
    email?: string;
  };
}

/** Handles HTTP requests for quiz attempt operations. */
export class QuizAttemptController {
  constructor(
    private startQuizAttemptUseCase: IStartQuizAttemptUseCase,
    private submitQuizAttemptUseCase: ISubmitQuizAttemptUseCase,
    private getQuizResultUseCase: IGetQuizResultUseCase,
    private getAllQuizAttemptsUseCase: IGetAllQuizAttemptsUseCase,
  ) {}

  /**
   * Start attempt for the QuizAttempt entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  startAttempt = async (req: Request, res: Response): Promise<void> => {
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
  };

  /**
   * Submit attempt for the QuizAttempt entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  submitAttempt = async (req: Request, res: Response): Promise<void> => {
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
  };

  /**
   * Get result for the QuizAttempt entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  getResult = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as unknown as IUserRequest).user?.id;
    const { courseId } = req.params;

    if (!userId) {
      ApiResponseHelper.unauthorized(res, 'Unauthorized');
      return;
    }

    const result = await this.getQuizResultUseCase.execute(courseId, userId);
    ApiResponseHelper.success(res, 'Quiz result retrieved', result);
  };

  /**
   * Get all attempts for the QuizAttempt entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  getAllAttempts = async (req: Request, res: Response): Promise<void> => {
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
  };
}
