import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/AuthenticatedRequestType';
import { ICheckEnrollment } from '../application/interfaces/ICheckEnrollment';
import { IGetInstructorEnrollmentsUseCase } from '../application/interfaces/IGetInstructorEnrollments';
import { IUpdateLessonProgressUseCase } from '../application/interfaces/IUpdateLessonProgress';
import { IGetStudentEnrollmentsUseCase } from '../application/interfaces/IGetStudentEnrollments';

import { ApiResponseHelper } from '../../../shared/utils/ApiResponseHelper';

export class EnrollmentController {
  constructor(
    private _checkEnrollmentUc: ICheckEnrollment,
    private _getInstructorEnrollmentsUc: IGetInstructorEnrollmentsUseCase,
    private _updateLessonProgressUc: IUpdateLessonProgressUseCase,
    private _getStudentEnrollmentsUc: IGetStudentEnrollmentsUseCase,
  ) {}

  async checkEnrollmentStatus(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        return ApiResponseHelper.unauthorized(res, 'Unauthorized');
      }

      const enrollment = await this._checkEnrollmentUc.execute(
        userId,
        courseId,
      );

      return ApiResponseHelper.success(res, 'Enrollment status checked', {
        isEnrolled: !!enrollment,
        enrollment: enrollment,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponseHelper.badRequest(res, message);
    }
  }

  async getInstructorEnrollments(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        return ApiResponseHelper.unauthorized(res, 'Unauthorized');
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 12;

      const filters = {
        search: req.query.search as string,
        courseId: req.query.courseId as string,
        status: req.query.status as string,
        sort: req.query.sort as 'newest' | 'oldest',
      };

      const enrollments = await this._getInstructorEnrollmentsUc.execute(
        userId,
        page,
        limit,
        filters,
      );

      return ApiResponseHelper.success(res, 'Enrollments fetched', enrollments);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponseHelper.badRequest(res, message);
    }
  }

  async updateProgress(req: Request, res: Response) {
    try {
      const { lessonId, lastWatchedSecond, totalDuration, isCompleted } =
        req.body;
      const { enrollmentId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        return ApiResponseHelper.unauthorized(res, 'Unauthorized');
      }

      const result = await this._updateLessonProgressUc.execute(
        enrollmentId,
        lessonId,
        { lastWatchedSecond, totalDuration, isCompleted },
      );
      return ApiResponseHelper.success(res, 'Progress updated', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponseHelper.badRequest(res, message);
    }
  }

  async getStudentEnrollments(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      if (!userId) {
        return ApiResponseHelper.unauthorized(res, 'Unauthorized');
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 6;

      const filters = {
        search: req.query.search as string,
        status: req.query.status as 'active' | 'completed',
      };

      const result = await this._getStudentEnrollmentsUc.execute(
        userId,
        page,
        limit,
        filters,
      );
      return ApiResponseHelper.success(res, 'Enrollments fetched', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponseHelper.badRequest(res, message);
    }
  }
}
