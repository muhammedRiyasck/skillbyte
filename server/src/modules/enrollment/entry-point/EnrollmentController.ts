import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/AuthenticatedRequestType';
import { ICheckEnrollmentUseCase } from '../application/interfaces/ICheckEnrollment';
import { IGetInstructorEnrollmentsUseCase } from '../application/interfaces/IGetInstructorEnrollments';
import { IUpdateLessonProgressUseCase } from '../application/interfaces/IUpdateLessonProgress';
import { IGetStudentEnrollmentsUseCase } from '../application/interfaces/IGetStudentEnrollments';
import { IInitiateEnrollmentPaymentUseCase } from '../application/interfaces/IInitiateEnrollmentPayment';
import { IEnrollFreeCourseUseCase } from '../application/interfaces/IEnrollFreeCourse';
import { ApiResponseHelper } from '../../../shared/utils/ApiResponseHelper';
import { EnrollmentStatus } from '../../../shared/enums/EnrollmentStatus';
import { UpdateLessonProgressRequestDto } from '../application/dtos/UpdateLessonProgressRequestDto';
import { InitiatePaymentRequestDto } from '../application/dtos/InitiatePaymentRequestDto';

export class EnrollmentController {
  constructor(
    private _checkEnrollmentUc: ICheckEnrollmentUseCase,
    private _getInstructorEnrollmentsUc: IGetInstructorEnrollmentsUseCase,
    private _updateLessonProgressUc: IUpdateLessonProgressUseCase,
    private _getStudentEnrollmentsUc: IGetStudentEnrollmentsUseCase,
    private _initiateEnrollmentPaymentUc: IInitiateEnrollmentPaymentUseCase,
    private _enrollFreeCourseUc: IEnrollFreeCourseUseCase,
  ) {}

  checkEnrollmentStatus = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
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
  };

  getInstructorEnrollments = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
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
  };

  updateProgress = async (req: Request, res: Response): Promise<void> => {
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
  };

  getStudentEnrollments = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
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
  };

  initiatePayment = async (req: Request, res: Response): Promise<void> => {
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
  };

  enrollFreeCourse = async (req: Request, res: Response): Promise<void> => {
    const { courseId } = req.body;
    const userId = (req as AuthenticatedRequest).user.id;

    if (!userId) {
      ApiResponseHelper.unauthorized(res, 'Unauthorized');
      return;
    }

    if (!courseId) {
      ApiResponseHelper.badRequest(res, 'courseId is required');
      return;
    }

    const result = await this._enrollFreeCourseUc.execute(userId, courseId);
    ApiResponseHelper.success(
      res,
      'Enrolled in free course successfully',
      result,
    );
  };
}
