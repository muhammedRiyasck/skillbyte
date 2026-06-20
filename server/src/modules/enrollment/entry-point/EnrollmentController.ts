import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/AuthenticatedRequestType';
import { ICheckEnrollment } from '../application/interfaces/ICheckEnrollment';
import { IGetInstructorEnrollmentsUseCase } from '../application/interfaces/IGetInstructorEnrollments';
import { IUpdateLessonProgress } from '../application/interfaces/IUpdateLessonProgress';
import { IGetStudentEnrollmentsUseCase } from '../application/interfaces/IGetStudentEnrollments';
import { IInitiateEnrollmentPayment } from '../application/interfaces/IInitiateEnrollmentPayment';
import { ApiResponseHelper } from '../../../shared/utils/ApiResponseHelper';
import { EnrollmentStatus } from '../../../shared/enums/EnrollmentStatus';
import { UpdateLessonProgressRequestDto } from '../application/dtos/UpdateLessonProgressRequestDto';
import { InitiatePaymentRequestDto } from '../application/dtos/InitiatePaymentRequestDto';

export class EnrollmentController {
  constructor(
    private _checkEnrollmentUc: ICheckEnrollment,
    private _getInstructorEnrollmentsUc: IGetInstructorEnrollmentsUseCase,
    private _updateLessonProgressUc: IUpdateLessonProgress,
    private _getStudentEnrollmentsUc: IGetStudentEnrollmentsUseCase,
    private _initiateEnrollmentPaymentUc: IInitiateEnrollmentPayment,
  ) {}

  async checkEnrollmentStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.params.id;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        ApiResponseHelper.unauthorized(res, 'Unauthorized');
        return;
      }

      const enrollment = await this._checkEnrollmentUc.execute(userId, id);

      ApiResponseHelper.success(res, 'Enrollment status checked', {
        isEnrolled: !!enrollment,
        enrollment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInstructorEnrollments(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        ApiResponseHelper.unauthorized(res, 'Unauthorized');
        return;
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 12;

      const filters = {
        search: req.query.search as string,
        id: req.query.id as string,
        status: req.query.status as string,
        sort: req.query.sort as 'newest' | 'oldest',
      };

      const enrollments = await this._getInstructorEnrollmentsUc.execute(
        userId,
        page,
        limit,
        filters,
      );

      ApiResponseHelper.success(res, 'Enrollments fetched', enrollments);
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto: UpdateLessonProgressRequestDto = req.body;
      const { enrollmentId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        ApiResponseHelper.unauthorized(res, 'Unauthorized');
        return;
      }

      const { lessonId, ...progressData } = dto;
      const result = await this._updateLessonProgressUc.execute(
        enrollmentId,
        lessonId,
        progressData,
      );
      ApiResponseHelper.success(res, 'Progress updated', result);
    } catch (error) {
      next(error);
    }
  }

  async getStudentEnrollments(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      if (!userId) {
        ApiResponseHelper.unauthorized(res, 'Unauthorized');
        return;
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 6;

      const filters = {
        search: req.query.search as string,
        status: req.query.status as EnrollmentStatus,
      };

      const result = await this._getStudentEnrollmentsUc.execute(
        userId,
        page,
        limit,
        filters,
      );
      ApiResponseHelper.success(res, 'Enrollments fetched', result);
    } catch (error) {
      next(error);
    }
  }

  async initiatePayment(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto: InitiatePaymentRequestDto = req.body;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        ApiResponseHelper.unauthorized(res, 'Unauthorized');
        return;
      }

      const result = await this._initiateEnrollmentPaymentUc.execute(
        userId,
        dto.id,
        dto.provider,
      );

      ApiResponseHelper.success(res, 'Payment initiated', result);
    } catch (error) {
      next(error);
    }
  }
}
