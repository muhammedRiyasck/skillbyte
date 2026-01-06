import { Types, PipelineStage } from 'mongoose';
import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IEnrollmentReadRepository } from '../../domain/IRepositories/IEnrollmentReadRepository';
import { IEnrollment as IEnrollmentEntity } from '../../domain/entities/Enrollment';
import { IInstructorEnrollment } from '../../types/IInstructorEnrollment';
import {
  EnrollmentModel,
  IEnrollment as IEnrollmentDocument,
} from '../models/EnrollmentModel';
import { IStudentEnrollment } from '../../types/IStudentEnrollment';
import { IEnrollmentFilters } from '../../types/IInstructorEnrollment';

export class EnrollmentReadRepository
  extends BaseRepository<IEnrollmentEntity, IEnrollmentDocument>
  implements IEnrollmentReadRepository
{
  constructor() {
    super(EnrollmentModel);
  }

  toEntity(doc: IEnrollmentDocument): IEnrollmentEntity {
    return {
      enrollmentId: doc._id.toString(),
      userId: doc.userId.toString(),
      courseId: doc.courseId.toString(),
      paymentId: doc.paymentId?.toString(),
      status: doc.status,
      enrolledAt: doc.enrolledAt,
      completedAt: doc.completedAt,
      progress: doc.progress,
      lessonProgress: doc.lessonProgress.map((lp) => ({
        lessonId: lp.lessonId.toString(),
        lastWatchedSecond: lp.lastWatchedSecond,
        totalDuration: lp.totalDuration,
        isCompleted: lp.isCompleted,
        lastUpdated: lp.lastUpdated,
      })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findEnrollment(
    userId: string,
    courseId: string,
  ): Promise<IEnrollmentEntity | null> {
    const doc = await this.model.findOne({ userId, courseId });
    return doc ? this.toEntity(doc) : null;
  }

  async findEnrollmentsForUser(
    userId: string,
    courseIds: string[],
  ): Promise<IEnrollmentEntity[]> {
    const docs = await this.model.find({
      userId,
      courseId: { $in: courseIds },
    });
    return docs.map((doc) => this.toEntity(doc));
  }

  async findEnrollmentsByUser(
    userId: string,
    page: number,
    limit: number,
    filters?: {
      search?: string;
      status?: 'active' | 'completed';
    },
  ): Promise<{ data: IStudentEnrollment[]; totalCount: number }> {
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
    ];

    if (filters?.status) {
      pipeline.push({
        $match: {
          status: filters.status,
        },
      });
    }

    if (filters?.search) {
      pipeline.push({
        $match: {
          'course.title': { $regex: filters.search, $options: 'i' },
        },
      });
    }

    pipeline.push(
      { $sort: { enrolledAt: -1 } },
      {
        $project: {
          _id: 1,
          enrolledAt: 1,
          progress: 1,
          status: 1,
          course: {
            courseId: '$course._id',
            title: '$course.title',
            thumbnailUrl: '$course.thumbnailUrl',
            subText: '$course.subText',
            category: '$course.category',
            courseLevel: '$course.courseLevel',
            language: '$course.language',
            price: '$course.price',
            rating: '$course.rating',
            reviews: '$course.reviews',
          },
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    );

    const result = await this.model.aggregate(pipeline);
    const data: IStudentEnrollment[] = result[0].data.map(
      (item: {
        enrolledAt: Date;
        progress: number;
        status: string;
        course: {
          courseId: Types.ObjectId;
          title: string;
          thumbnailUrl: string;
          subText: string;
          category: string;
          courseLevel: string;
          language: string;
          price: number;
          rating: number;
          reviews: number;
        };
      }) => ({
        ...item.course,
        courseId: item.course.courseId.toString(),
        enrolledAt: item.enrolledAt,
        progress: item.progress,
        enrollmentStatus: item.status,
        isEnrolled: true,
      }),
    );
    const totalCount = result[0].totalCount[0]?.count || 0;

    return { data, totalCount };
  }

  async findEnrollmentsByInstructor(
    instructorId: Types.ObjectId,
    page: number,
    limit: number,
    filters?: IEnrollmentFilters,
  ): Promise<IInstructorEnrollment[]> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(limit, 50);
    const skip = (safePage - 1) * safeLimit;

    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $match: {
          'course.instructorId': instructorId,
        },
      },
    ];

    if (filters?.courseId) {
      pipeline.push({
        $match: {
          courseId: new Types.ObjectId(filters.courseId),
        },
      });
    }

    if (filters?.status) {
      pipeline.push({
        $match: {
          status: filters.status,
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'students',
          localField: 'userId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
    );

    if (filters?.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'student.name': searchRegex },
            { 'student.email': searchRegex },
          ],
        },
      });
    }

    if (filters?.sort === 'oldest') {
      pipeline.push({ $sort: { enrolledAt: 1 } });
    } else {
      pipeline.push({ $sort: { enrolledAt: -1 } });
    }

    pipeline.push(
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
            price: '$course.price',
          },
          status: 1,
          enrolledAt: 1,
          progress: 1,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: safeLimit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    );

    return await this.model.aggregate(pipeline);
  }
}
