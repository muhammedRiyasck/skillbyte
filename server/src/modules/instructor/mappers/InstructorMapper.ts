import { Instructor } from '../domain/entities/Instructor';

export class InstructorMapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toEntity(doc: any): Instructor {
    return new Instructor(
      doc.name,
      doc.email,
      doc.passwordHash,
      doc.subject,
      doc.jobTitle,
      doc.experience,
      doc.socialProfile,
      doc.portfolio,
      doc.bio,
      doc.phoneNumber,
      doc.resumeUrl,
      doc.profilePictureUrl,
      doc.isEmailVerified,
      doc.accountStatus,
      doc.approved,
      doc.suspendNote,
      doc.rejected,
      doc.rejectedNote,
      doc.doneBy,
      doc.doneAt,
      doc.averageRating,
      doc.totalReviews,
      doc._id.toString(),
    );
  }

  // input
  static toPersistence(entity: Instructor): Record<string, unknown> {
    return {
      name: entity.name,
      email: entity.email,
      passwordHash: entity.passwordHash,
      subject: entity.subject,
      jobTitle: entity.jobTitle,
      experience: entity.experience,
      socialProfile: entity.socialProfile,
      portfolio: entity.portfolio,
      bio: entity.bio,
      phoneNumber: entity.phoneNumber,
      resumeUrl: entity.resumeUrl,
      profilePictureUrl: entity.profilePictureUrl,
      isEmailVerified: entity.isEmailVerified,
      accountStatus: entity.accountStatus,
      approved: entity.approved,
      suspendNote: entity.suspendNote,
      rejected: entity.rejected,
      rejectedNote: entity.rejectedNote,
      doneBy: entity.doneBy,
      doneAt: entity.doneAt,
      averageRating: entity.averageRating,
      totalReviews: entity.totalReviews,
    };
  }
}
