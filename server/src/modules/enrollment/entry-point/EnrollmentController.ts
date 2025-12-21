import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/AuthenticatedRequestType';
import logger from '../../../shared/utils/Logger';
import { ICreatePaymentIntent } from '../application/interfaces/ICreatePaymentIntent';
import { IHandleStripeWebhook } from '../application/interfaces/IHandleStripeWebhook';
import { ICheckEnrollment } from '../application/interfaces/ICheckEnrollment';
import { IGetInstructorEnrollmentsUseCase } from '../application/interfaces/IGetInstructorEnrollments';
import { IUpdateLessonProgressUseCase } from '../application/interfaces/IUpdateLessonProgress';
import { IGetUserPurchases } from '../application/interfaces/IGetUserPurchases';
import { IGetInstructorEarnings } from '../application/interfaces/IGetInstructorEarnings';
import { ApiResponseHelper } from '../../../shared/utils/ApiResponseHelper';

export class EnrollmentController {
  constructor(
    private _createPaymentIntentUc: ICreatePaymentIntent,
    private _handleStripeWebhookUc: IHandleStripeWebhook,
    private _checkEnrollmentUc: ICheckEnrollment,
    private _getInstructorEnrollmentsUc: IGetInstructorEnrollmentsUseCase,
    private _updateLessonProgressUc: IUpdateLessonProgressUseCase,
    private _getUserPurchasesUc: IGetUserPurchases,
    private _getInstructorEarningsUc: IGetInstructorEarnings,
  ) {}

  async createPaymentIntent(req: Request, res: Response) {
    try {
      const { courseId } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        return ApiResponseHelper.unauthorized(res, 'Unauthorized');
      }

      const result = await this._createPaymentIntentUc.execute(
        userId,
        courseId,
      );
      return ApiResponseHelper.success(res, 'Payment intent created', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponseHelper.badRequest(res, message);
    }
  }

  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    // Need raw body here.
    const payload = req.body;

    if (!sig) {
      return res.status(400).send('Webhook Error: Missing signature');
    }

    try {
      // logger.info(`Checkout session created`);
      await this._handleStripeWebhookUc.execute(sig as string, payload);
      return res.status(200).send({ received: true });
    } catch (error) {
      logger.error('Webhook Error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(400).send(`Webhook Error: ${message}`);
    }
  }

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

  async getUserPurchases(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      if (!userId) {
        return ApiResponseHelper.unauthorized(res, 'Unauthorized');
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await this._getUserPurchasesUc.execute(
        userId,
        page,
        limit,
      );
      return ApiResponseHelper.success(res, 'Purchases fetched', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponseHelper.badRequest(res, message);
    }
  }

  async getInstructorEarnings(req: Request, res: Response) {
    try {
      const instructorId = (req as AuthenticatedRequest).user.id;
      if (!instructorId) {
        return ApiResponseHelper.unauthorized(res, 'Unauthorized');
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await this._getInstructorEarningsUc.execute(
        instructorId,
        page,
        limit,
      );
      return ApiResponseHelper.success(res, 'Earnings fetched', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponseHelper.badRequest(res, message);
    }
  }
}
