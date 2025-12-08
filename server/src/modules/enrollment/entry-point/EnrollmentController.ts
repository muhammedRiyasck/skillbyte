import { Request, Response } from "express";
import { EnrollmentRepository } from "../infrastructure/repositories/EnrollmentRepository";
import { CreatePaymentIntent } from "../application/CreatePaymentIntent";
import { HandleStripeWebhook } from "../application/HandleStripeWebhook";

export class EnrollmentController {
  private createPaymentIntentService: CreatePaymentIntent;
  private handleStripeWebhookService: HandleStripeWebhook;

  constructor() {
    const enrollmentRepository = new EnrollmentRepository();
    this.createPaymentIntentService = new CreatePaymentIntent(enrollmentRepository);
    this.handleStripeWebhookService = new HandleStripeWebhook(enrollmentRepository);
  }

  async createPaymentIntent(req: Request, res: Response) {
    try {
      const { courseId } = req.body;
      const userId = (req.user as any)?.id // Assuming auth middleware populates req.user
      
      if (!userId) {
          return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await this.createPaymentIntentService.execute(userId, courseId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"];
    // Need raw body here.
    const payload = req.body; 

    if (!sig) {
        return res.status(400).send("Webhook Error: Missing signature");
    }

    try {
      await this.handleStripeWebhookService.execute(sig as string, payload);
      res.status(200).send({ received: true });
    } catch (error: any) {
      console.error(error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
}
