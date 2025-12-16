import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/AuthenticatedRequestType';
import logger from '../../../shared/utils/Logger';
import { ICreatePaymentIntent } from '../application/interfaces/ICreatePaymentIntent';
import { IHandleStripeWebhook } from '../application/interfaces/IHandleStripeWebhook';
import { ICheckEnrollment } from '../application/interfaces/ICheckEnrollment';
import { IGetInstructorEnrollmentsUseCase } from '../application/interfaces/IGetInstructorEnrollments';
import { IUpdateLessonProgressUseCase } from '../application/interfaces/IUpdateLessonProgress';

export class EnrollmentController {
  constructor(
    private _createPaymentIntentUc: ICreatePaymentIntent,
    private _handleStripeWebhookUc: IHandleStripeWebhook,
    private _checkEnrollmentUc: ICheckEnrollment,
    private _getInstructorEnrollmentsUc: IGetInstructorEnrollmentsUseCase,
    private _updateLessonProgressUc: IUpdateLessonProgressUseCase,
  ) {}

  async createPaymentIntent(req: Request, res: Response) {
    try {
      const { courseId } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await this._createPaymentIntentUc.execute(
        userId,
        courseId,
      );
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
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
      res.status(200).send({ received: true });
    } catch (error) {
      logger.error('Webhook Error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).send(`Webhook Error: ${message}`);
    }
  }

  async checkEnrollmentStatus(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const enrollment = await this._checkEnrollmentUc.execute(
        userId,
        courseId,
      );

      res.status(200).json({
        isEnrolled: !!enrollment,
        enrollment: enrollment,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  }

  async getInstructorEnrollments(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const enrollments =
        await this._getInstructorEnrollmentsUc.execute(userId);

      res.status(200).json({
        enrollments,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  }

  async updateProgress(req: Request, res: Response) {
    try {
      const { lessonId, lastWatchedSecond, totalDuration, isCompleted } =
        req.body;
      const { enrollmentId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await this._updateLessonProgressUc.execute(
        enrollmentId,
        lessonId,
        { lastWatchedSecond, totalDuration, isCompleted },
      );
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  }
}
