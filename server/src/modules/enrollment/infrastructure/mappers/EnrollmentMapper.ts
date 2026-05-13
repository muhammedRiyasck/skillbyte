import { IEnrollment as IEnrollmentEntity } from '../../domain/entities/Enrollment';
import { IEnrollment as IEnrollmentDocument } from '../models/EnrollmentModel';
import { EnrollmentStatus } from '../../../../shared/enums/EnrollmentStatus';
import { IStudentEnrollment } from '../../types/IStudentEnrollment';
import { Types } from 'mongoose';

export class EnrollmentMapper {
  static toEntity(doc: IEnrollmentDocument): IEnrollmentEntity {
    return {
      enrollmentId: doc._id.toString(),
      userId: doc.userId.toString(),
      courseId: doc.courseId.toString(),
      paymentId: doc.paymentId?.toString(),
      status: doc.status as EnrollmentStatus,
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

  static toStudentEnrollment(item: {
    enrolledAt: Date;
    progress: number;
    status: string;
    course: {
      id: Types.ObjectId;
      instructorId: Types.ObjectId;
      title: string;
      thumbnailUrl: string;
      subText: string;
      category: string;
      courseLevel: string;
      language: string;
      price: number;
      averageRating: number;
      totalReviews: number;
    };
  }): IStudentEnrollment {
    return {
      ...item.course,
      id: item.course.id.toString(),
      instructorId: item.course.instructorId.toString(),
      enrolledAt: item.enrolledAt,
      progress: item.progress,
      enrollmentStatus: item.status as EnrollmentStatus,
      isEnrolled: true,
    };
  }
}
