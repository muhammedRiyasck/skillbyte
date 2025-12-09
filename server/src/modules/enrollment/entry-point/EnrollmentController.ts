import { Request, Response } from 'express';
import { ICreatePaymentIntent } from '../application/interface/ICreatePaymentIntent';
import { IHandleStripeWebhook } from '../application/interface/IHandleStripeWebhook';
import { ICheckEnrollment } from '../application/interface/ICheckEnrollment';

export class EnrollmentController {

  constructor(
    private _createPaymentIntentUc: ICreatePaymentIntent,
    private _handleStripeWebhookUc: IHandleStripeWebhook,
    private _checkEnrollmentUc : ICheckEnrollment
  ) {}

  async createPaymentIntent(req: Request, res: Response) {
    try {
      const { courseId } = req.body;
      const userId = (req.user as any)?.id; // Assuming auth middleware populates req.user

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await this._createPaymentIntentUc.execute(
        userId,
        courseId,
      );
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
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
      await this._handleStripeWebhookUc.execute(sig as string, payload);
      res.status(200).send({ received: true });
    } catch (error: any) {
      console.error(error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }

  async checkEnrollmentStatus(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = (req.user as any)?.id;

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
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
