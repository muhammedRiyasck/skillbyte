import { Types, PipelineStage } from 'mongoose';
import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IPaymentRepository } from '../../domain/IPaymentRepository';
import { PaymentModel, IPayment } from '../models/PaymentModel';
import {
  IPaymentHistory,
  IInstructorEarnings,
} from '../../types/IPaymentHistory';

export class PaymentRepository
  extends BaseRepository<IPayment, IPayment>
  implements IPaymentRepository
{
  constructor() {
    super(PaymentModel);
  }

  toEntity(doc: IPayment): IPayment {
    return doc;
  }

  async createPayment(paymentData: Partial<IPayment>): Promise<IPayment> {
    return await PaymentModel.create(paymentData);
  }

  async findPaymentByIntentId(
    paymentIntentId: string,
  ): Promise<IPayment | null> {
    return await PaymentModel.findOne({
      stripePaymentIntentId: paymentIntentId,
    });
  }

  async findPaymentByPayPalOrderId(orderId: string): Promise<IPayment | null> {
    return await PaymentModel.findOne({ paypalOrderId: orderId });
  }

  async updatePaymentStatus(
    paymentIntentId: string,
    status: string,
  ): Promise<IPayment | null> {
    return await PaymentModel.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      { status },
      { new: true },
    );
  }

  async updatePaymentStatusByPayPalOrder(
    orderId: string,
    status: string,
  ): Promise<IPayment | null> {
    return await PaymentModel.findOneAndUpdate(
      { paypalOrderId: orderId },
      { status },
      { new: true },
    );
  }

  async findPaymentsByUser(
    userId: string,
    page: number,
    limit: number,
    filters?: { status?: string; startDate?: Date; endDate?: Date },
  ): Promise<IPaymentHistory[]> {
    const skip = (page - 1) * limit;
    const pipeline: PipelineStage[] = [
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      // Filter Logic Start
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
      // Filter Logic End
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          courseId: {
            _id: '$course._id',
            title: '$course.title',
            thumbnailUrl: '$course.thumbnailUrl',
          },
          amount: 1,
          currency: 1,
          status: 1,
          createdAt: 1,
          stripePaymentIntentId: 1,
          paypalOrderId: 1,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    return (await PaymentModel.aggregate(
      pipeline,
    )) as unknown as IPaymentHistory[];
  }

  async findPaymentsByInstructor(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<IInstructorEarnings[]> {
    const skip = (page - 1) * limit;
    const pipeline: PipelineStage[] = [
      {
        $match: {
          instructorId: new Types.ObjectId(instructorId),
          status: 'succeeded',
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'userId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          userId: {
            _id: '$student._id',
            name: '$student.name',
            email: '$student.email',
          },
          courseId: {
            _id: '$course._id',
            title: '$course.title',
            thumbnailUrl: '$course.thumbnailUrl',
          },
          amount: 1,
          adminFee: 1,
          instructorAmount: 1,
          currency: 1,
          status: 1,
          createdAt: 1,
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

    return (await PaymentModel.aggregate(
      pipeline,
    )) as unknown as IInstructorEarnings[];
  }
}
