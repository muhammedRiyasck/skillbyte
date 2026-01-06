import { Types, PipelineStage } from 'mongoose';
import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IPayment } from '../../domain/entities/Payment';
import { IPaymentReadRepository } from '../../domain/IRepositories/IPaymentReadRepository';
import { PaymentModel } from '../models/PaymentModel';
import { IPaymentDocument } from '../types/IPaymentDocument';

export class PaymentReadRepository
  extends BaseRepository<IPayment, IPaymentDocument>
  implements IPaymentReadRepository
{
  constructor() {
    super(PaymentModel);
  }

  toEntity(doc: IPaymentDocument): IPayment {
    return {
      paymentId: doc._id.toString(),
      userId: doc.userId.toString(),
      studentName: doc.studentName,
      studentEmail: doc.studentEmail,
      courseId: doc.courseId.toString(),
      amount: doc.amount,
      currency: doc.currency,
      stripePaymentIntentId: doc.stripePaymentIntentId,
      paypalOrderId: doc.paypalOrderId,
      status: doc.status,
      metadata: doc.metadata,
      instructorId: doc.instructorId.toString(),
      adminFee: doc.adminFee,
      instructorAmount: doc.instructorAmount,
      productName: doc.productName,
      productImage: doc.productImage,
      convertedAmount: doc.convertedAmount,
      convertedCurrency: doc.convertedCurrency,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findPaymentByIntentId(
    paymentIntentId: string,
  ): Promise<IPayment | null> {
    const doc = await this.model.findOne({
      stripePaymentIntentId: paymentIntentId,
    });
    return doc ? this.toEntity(doc) : null;
  }

  async findPaymentByPayPalOrderId(orderId: string): Promise<IPayment | null> {
    const doc = await this.model.findOne({ paypalOrderId: orderId });
    return doc ? this.toEntity(doc) : null;
  }

  async findPaymentsByUser(
    userId: string,
    page: number,
    limit: number,
    filters?: { status?: string; startDate?: Date; endDate?: Date },
  ): Promise<{ data: IPayment[]; totalCount: number }> {
    const skip = (page - 1) * limit;
    const pipeline: PipelineStage[] = [
      { $match: { userId: new Types.ObjectId(userId) } },
      ...(filters?.status && filters.status !== 'all'
        ? [{ $match: { status: filters.status } }]
        : []),
      ...(filters?.startDate || filters?.endDate
        ? [
            {
              $match: {
                createdAt: {
                  ...(filters.startDate ? { $gte: filters.startDate } : {}),
                  ...(filters.endDate ? { $lte: filters.endDate } : {}),
                },
              },
            },
          ]
        : []),
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          userId: 1,
          studentName: 1,
          studentEmail: 1,
          courseId: 1,
          amount: 1,
          currency: 1,
          status: 1,
          createdAt: 1,
          stripePaymentIntentId: 1,
          paypalOrderId: 1,
          instructorId: 1,
          adminFee: 1,
          instructorAmount: 1,
          productName: 1,
          productImage: 1,
          convertedAmount: 1,
          convertedCurrency: 1,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const result = await this.model.aggregate(pipeline);
    const data = result[0].data.map((doc: IPaymentDocument) =>
      this.toEntity(doc as IPaymentDocument),
    );
    const totalCount = result[0].totalCount[0]?.count || 0;

    return { data, totalCount };
  }

  async findPaymentsByInstructor(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: IPayment[];
    totalCount: number;
    totalRevenue: number;
    totalProfit: number;
  }> {
    const skip = (page - 1) * limit;
    const pipeline: PipelineStage[] = [
      {
        $match: {
          instructorId: new Types.ObjectId(instructorId),
          status: 'succeeded',
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          userId: 1,
          studentName: 1,
          studentEmail: 1,
          courseId: 1,
          amount: 1,
          adminFee: 1,
          instructorAmount: 1,
          currency: 1,
          status: 1,
          createdAt: 1,
          instructorId: 1,
          productName: 1,
          productImage: 1,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
          totalRevenue: [{ $group: { _id: null, total: { $sum: '$amount' } } }],
          totalProfit: [
            { $group: { _id: null, total: { $sum: '$instructorAmount' } } },
          ],
        },
      },
    ];

    const result = await this.model.aggregate(pipeline);
    const data = result[0].data.map((doc: IPaymentDocument) =>
      this.toEntity(doc as IPaymentDocument),
    );
    const totalCount = result[0].totalCount[0]?.count || 0;
    const totalRevenue = result[0].totalRevenue[0]?.total || 0;
    const totalProfit = result[0].totalProfit[0]?.total || 0;

    return { data, totalCount, totalRevenue, totalProfit };
  }
}
