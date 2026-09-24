import { Student } from '../../domain/entities/Student';
import { IStudent as IStudentDocument } from '../models/StudentModel';

/** Handles student mapper functionality. */
export class StudentMapper {
  /**
   * To entity for the StudentMapper entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  static toEntity(doc: IStudentDocument): Student {
    return new Student(
      doc.name,
      doc.email,
      doc.passwordHash || '',
      doc.isEmailVerified,
      doc.registeredVia,
      doc.profilePictureUrl,
      doc.accountStatus,
      doc._id.toString(),
      doc.headline,
      doc.bio,
      doc.phoneNumber,
      doc.timezone,
      doc.location,
      doc.socialLinks,
      doc.interests,
      doc.experienceLevel,
      doc.learningGoals,
      doc.xp,
      doc.currentStreak,
      doc.longestStreak,
      doc.lastActiveDate,
      doc.createdAt,
    );
  }
}
