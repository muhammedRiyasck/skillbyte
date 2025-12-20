import { Types } from 'mongoose';
import { IEnrollmentRepository } from '../../domain/IEnrollmentRepository';
import { IInstructorEnrollment } from '../../types/IInstructorEnrollment';
import { EnrollmentModel, IEnrollment } from '../models/EnrollmentModel';
import { PaymentModel, IPayment } from '../models/PaymentModel';
import { ModuleModel } from '../../../course/infrastructure/models/ModuleModel';
import { LessonModel } from '../../../course/infrastructure/models/LessonModel';

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
  ): Promise<IInstructorEnrollment[]> {
    // Find enrollments where the course belongs to the instructor
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(limit, 50);
    const skip = (safePage - 1) * safeLimit;
    return await EnrollmentModel.aggregate([
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
    ]);
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
}
