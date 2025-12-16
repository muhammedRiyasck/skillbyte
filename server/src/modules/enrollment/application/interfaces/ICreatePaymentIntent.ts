export interface ICreatePaymentIntent {
  execute(
    userId: string,
    courseId: string,
  ): Promise<{ clientSecret: string | null; paymentId: string }>;
}
