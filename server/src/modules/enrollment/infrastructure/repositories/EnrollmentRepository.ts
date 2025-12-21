import { Types, PipelineStage } from 'mongoose';
import { IEnrollmentRepository } from '../../domain/IEnrollmentRepository';
import { IInstructorEnrollment } from '../../types/IInstructorEnrollment';
import { EnrollmentModel, IEnrollment } from '../models/EnrollmentModel';
import { PaymentModel, IPayment } from '../models/PaymentModel';
import { ModuleModel } from '../../../course/infrastructure/models/ModuleModel';
import { LessonModel } from '../../../course/infrastructure/models/LessonModel';
import { IEnrollmentFilters } from '../../types/IInstructorEnrollment';
import {
  IPaymentHistory,
  IInstructorEarnings,
} from '../../types/IPaymentHistory';
export class EnrollmentRepository implements IEnrollmentRepository {
  async createEnrollment(
    enrollmentData: Partial<IEnrollment>,
  ): Promise<IEnrollment> {
    return await EnrollmentModel.create(enrollmentData);
  }

  async findEnrollment(
    userId: string,
    courseId: string,
  ): Promise<IEnrollment | null> {
    return await EnrollmentModel.findOne({ userId, courseId });
  }

  async findEnrollmentsForUser(
    userId: string,
    courseIds: string[],
  ): Promise<IEnrollment[]> {
    return await EnrollmentModel.find({ userId, courseId: { $in: courseIds } });
  }

  async findEnrolledCourseIds(userId: string): Promise<string[]> {
    const courseIds = await EnrollmentModel.distinct('courseId', { userId });
    return courseIds.map((id) => id.toString());
  }

  async findEnrollmentsByInstructor(
    instructorId: Types.ObjectId,
    page: number,
    limit: number,
    filters?: IEnrollmentFilters,
  ): Promise<IInstructorEnrollment[]> {
    // Find enrollments where the course belongs to the instructor
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

    // Filter by Course if specified
    if (filters?.courseId) {
      pipeline.push({
        $match: {
          courseId: new Types.ObjectId(filters.courseId),
        },
      });
    }

    // Filter by Status if specified
    if (filters?.status) {
      pipeline.push({
        $match: {
          status: filters.status,
        },
      });
    }

    // Lookup Student for searching
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

    // Search by student name or email
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

    // Sorting
    if (filters?.sort === 'oldest') {
      pipeline.push({ $sort: { enrolledAt: 1 } });
    } else {
      // Default to newest
      pipeline.push({ $sort: { enrolledAt: -1 } });
    }

    // Project and Facet
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

    return await EnrollmentModel.aggregate(pipeline);
  }

  async updateEnrollmentStatus(
    enrollmentId: string,
    status: string,
  ): Promise<IEnrollment | null> {
    return await EnrollmentModel.findByIdAndUpdate(
      enrollmentId,
      { status },
      { new: true },
    );
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
  async updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    progressData: {
      lastWatchedSecond: number;
      totalDuration: number;
      isCompleted: boolean;
    },
  ): Promise<IEnrollment | null> {
    const enrollment = await EnrollmentModel.findOne({
      _id: enrollmentId,
      'lessonProgress.lessonId': lessonId,
    });

    if (enrollment) {
      // Update existing
      await EnrollmentModel.findOneAndUpdate(
        { _id: enrollmentId, 'lessonProgress.lessonId': lessonId },
        {
          $set: {
            'lessonProgress.$.lastWatchedSecond':
              progressData.lastWatchedSecond,
            'lessonProgress.$.totalDuration': progressData.totalDuration,
            'lessonProgress.$.isCompleted': progressData.isCompleted,
            'lessonProgress.$.lastUpdated': new Date(),
          },
        },
        { new: true },
      );
    } else {
      // Push new
      await EnrollmentModel.findByIdAndUpdate(
        enrollmentId,
        {
          $push: {
            lessonProgress: {
              lessonId,
              ...progressData,
              lastUpdated: new Date(),
            },
          },
        },
        { new: true },
      );
    }

    // --- Recalculate Overall Progress ---
    const updatedEnrollment = await EnrollmentModel.findById(enrollmentId);
    if (!updatedEnrollment) return null;

    // 1. Get total lessons count for the course
    //    Find all modules for this course
    const modules = await ModuleModel.find({
      courseId: updatedEnrollment.courseId,
    }).select('_id');
    const moduleIds = modules.map((m) => m._id);

    //    Count all published lessons in these modules
    //    (Assuming we only count published lessons as 'total' for the student)
    //    TEMPORARY: Removing isPublished check to see if that's the cause, or logging it.
    const totalLessons = await LessonModel.countDocuments({
      moduleId: { $in: moduleIds },
      // isPublished: true, // Commenting out strictly for debug if needed, but let's log first
    });

    // 2. Count completed lessons in enrollment
    const completedLessons =
      updatedEnrollment.lessonProgress?.filter(
        (p: { isCompleted: boolean }) => p.isCompleted,
      ).length || 0;

    // 3. Calculate percentage
    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    // 4. Update the enrollment with new progress
    const updateData: Record<string, unknown> = {
      progress: progressPercentage,
    };
    if (
      progressPercentage === 100 &&
      updatedEnrollment.status !== 'completed'
    ) {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
    }

    return await EnrollmentModel.findByIdAndUpdate(enrollmentId, updateData, {
      new: true,
    });
  }

  async findPaymentsByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<IPaymentHistory[]> {
    const skip = (page - 1) * limit;
    const pipeline: PipelineStage[] = [
      { $match: { userId: new Types.ObjectId(userId), status: 'succeeded' } },
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
