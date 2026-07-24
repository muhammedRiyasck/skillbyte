import { Types, PipelineStage, FilterQuery } from 'mongoose';
import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IPayment } from '../../domain/entities/Payment';
import { IPaymentReadRepository } from '../../domain/IRepositories/IPaymentReadRepository';
import { InstructorEarningsTrendPointDto } from '../../application/dtos/InstructorEarningsTrendPointDto';
import { PaymentModel } from '../models/PaymentModel';
import { IPaymentDocument } from '../types/IPaymentDocument';
import { PaymentMapper } from '../mappers/PaymentMapper';

export class PaymentReadRepository
  extends BaseRepository<IPayment, IPaymentDocument>
  implements IPaymentReadRepository
{
  constructor() {
    super(PaymentModel);
  }

  toEntity(doc: IPaymentDocument): IPayment {
    return PaymentMapper.toEntity(doc);
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
          mentorshipBookingId: 1,
          amount: 1,
          currency: 1,
          status: 1,
          createdAt: 1,
          stripePaymentIntentId: 1,
          paypalOrderId: 1,
          paypalCaptureId: 1,
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
    options?: { search?: string; filter?: string },
  ): Promise<{
    data: IPayment[];
    totalCount: number;
    totalRevenue: number;
    totalProfit: number;
  }> {
    const skip = (page - 1) * limit;
    const { search, filter } = options ?? {};

    const pipeline: PipelineStage[] = [
      {
        $match: {
          instructorId: new Types.ObjectId(instructorId),
          status: 'succeeded',
        },
      },
      // Search filter
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { studentName: { $regex: search, $options: 'i' } },
                  { studentEmail: { $regex: search, $options: 'i' } },
                  { productName: { $regex: search, $options: 'i' } },
                ],
              },
            } as PipelineStage,
          ]
        : []),
      // Product type filter
      ...(filter === 'course'
        ? [
            {
              $match: { courseId: { $exists: true, $ne: null } },
            } as PipelineStage,
          ]
        : filter === 'mentorship'
          ? [
              {
                $match: { mentorshipBookingId: { $exists: true, $ne: null } },
              } as PipelineStage,
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
          adminFee: 1,
          instructorAmount: 1,
          currency: 1,
          status: 1,
          createdAt: 1,
          instructorId: 1,
          productName: 1,
          productImage: 1,
          usdAmount: {
            $cond: {
              if: { $eq: [{ $toUpper: '$currency' }, 'INR'] },
              then: { $divide: ['$amount', 83] },
              else: '$amount',
            },
          },
          usdInstructorAmount: {
            $cond: {
              if: { $eq: [{ $toUpper: '$currency' }, 'INR'] },
              then: { $divide: ['$instructorAmount', 83] },
              else: '$instructorAmount',
            },
          },
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
          totalRevenue: [
            { $group: { _id: null, total: { $sum: '$usdAmount' } } },
          ],
          totalProfit: [
            { $group: { _id: null, total: { $sum: '$usdInstructorAmount' } } },
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

  async findInstructorEarningsTrend(
    instructorId: string,
    days: number,
  ): Promise<InstructorEarningsTrendPointDto[]> {
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

    const result = await this.model.aggregate<InstructorEarningsTrendPointDto>([
      {
        $match: {
          instructorId: new Types.ObjectId(instructorId),
          status: 'succeeded',
          createdAt: { $gte: startDate },
        },
      },
      {
        $project: {
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          usdAmount: {
            $cond: {
              if: { $eq: [{ $toUpper: '$currency' }, 'INR'] },
              then: { $divide: ['$amount', 83] },
              else: '$amount',
            },
          },
          usdInstructorAmount: {
            $cond: {
              if: { $eq: [{ $toUpper: '$currency' }, 'INR'] },
              then: { $divide: ['$instructorAmount', 83] },
              else: '$instructorAmount',
            },
          },
          isCoursePurchase: {
            $ne: [{ $ifNull: ['$courseId', null] }, null],
          },
        },
      },
      {
        $group: {
          _id: '$date',
          revenue: { $sum: '$usdAmount' },
          profit: { $sum: '$usdInstructorAmount' },
          enrollments: {
            $sum: { $cond: ['$isCoursePurchase', 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: { $round: ['$revenue', 2] },
          profit: { $round: ['$profit', 2] },
          enrollments: 1,
        },
      },
    ]);

    return result;
  }

  async findPaymentByUserAndProduct(
    userId: string,
    courseId?: string,
    mentorshipBookingId?: string,
    status?: string,
  ): Promise<IPayment | null> {
    const query: FilterQuery<IPaymentDocument> = {
      userId: new Types.ObjectId(userId),
    };
    if (courseId) {
      query.courseId = new Types.ObjectId(courseId);
    }
    if (mentorshipBookingId) {
      query.mentorshipBookingId = new Types.ObjectId(mentorshipBookingId);
    }
    if (status) {
      query.status = status;
    }

    // In case there are multiple, get the most recent one
    const doc = await this.model.findOne(query).sort({ createdAt: -1 });
    return doc ? this.toEntity(doc) : null;
  }
}
