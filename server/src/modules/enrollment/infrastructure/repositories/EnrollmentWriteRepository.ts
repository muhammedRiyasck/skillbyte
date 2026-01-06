import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IEnrollmentWriteRepository } from '../../domain/IRepositories/IEnrollmentWriteRepository';
import { IEnrollment as IEnrollmentEntity } from '../../domain/entities/Enrollment';
import {
  EnrollmentModel,
  IEnrollment as IEnrollmentDocument,
} from '../models/EnrollmentModel';

export class EnrollmentWriteRepository
  extends BaseRepository<IEnrollmentEntity, IEnrollmentDocument>
  implements IEnrollmentWriteRepository
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

  async updateEnrollmentStatus(
    enrollmentId: string,
    status: string,
  ): Promise<IEnrollmentEntity | null> {
    const doc = await this.model.findByIdAndUpdate(
      enrollmentId,
      { status },
      { new: true },
    );
    return doc ? this.toEntity(doc) : null;
  }

  async updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    progressData: {
      lastWatchedSecond: number;
      totalDuration: number;
      isCompleted: boolean;
    },
  ): Promise<IEnrollmentEntity | null> {
    const enrollment = await this.model.findOne({
      _id: enrollmentId,
      'lessonProgress.lessonId': lessonId,
    });

    let doc;
    if (enrollment) {
      doc = await this.model.findOneAndUpdate(
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
      doc = await this.model.findByIdAndUpdate(
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

    return doc ? this.toEntity(doc) : null;
  }

  async updateProgress(
    enrollmentId: string,
    progress: number,
    status?: string,
    completedAt?: Date,
  ): Promise<IEnrollmentEntity | null> {
    const updateData: Record<string, unknown> = { progress };
    if (status) updateData.status = status;
    if (completedAt) updateData.completedAt = completedAt;

    const doc = await this.model.findByIdAndUpdate(enrollmentId, updateData, {
      new: true,
    });
    return doc ? this.toEntity(doc) : null;
  }
}
