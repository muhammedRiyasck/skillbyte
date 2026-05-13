import { Types, PipelineStage } from 'mongoose';
import { EnrollmentStatus } from '../../../../shared/enums/EnrollmentStatus';
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
import { EnrollmentMapper } from '../mappers/EnrollmentMapper';

export class EnrollmentReadRepository
  extends BaseRepository<IEnrollmentEntity, IEnrollmentDocument>
  implements IEnrollmentReadRepository
{
  constructor() {
    super(EnrollmentModel);
  }

  toEntity(doc: IEnrollmentDocument): IEnrollmentEntity {
    return EnrollmentMapper.toEntity(doc);
  }

  async findEnrollment(
    userId: string,
    courseId: string,
  ): Promise<IEnrollmentEntity | null> {
    const doc = await this.model.findOne({ userId, courseId });
    return doc ? this.toEntity(doc) : null;
  }

  async findStudentIdsByCourseId(courseId: string): Promise<string[]> {
    const docs = await this.model
      .find({ courseId, status: EnrollmentStatus.ACTIVE })
      .select('userId')
      .lean();
    return docs.map((doc) => doc.userId.toString());
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
      status?: EnrollmentStatus;
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
            id: '$course._id',
            instructorId: '$course.instructorId',
            title: '$course.title',
            thumbnailUrl: '$course.thumbnailUrl',
            subText: '$course.subText',
            category: '$course.category',
            courseLevel: '$course.courseLevel',
            language: '$course.language',
            price: '$course.price',
            averageRating: '$course.averageRating',
            totalReviews: '$course.totalReviews',
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
      (item: Parameters<typeof EnrollmentMapper.toStudentEnrollment>[0]) =>
        EnrollmentMapper.toStudentEnrollment(item),
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

    if (filters?.id) {
      pipeline.push({
        $match: {
          courseId: new Types.ObjectId(filters.id),
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
