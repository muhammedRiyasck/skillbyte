import { InstructorModel } from "../infrastructure/models/InstructorModel"
import { Instructor } from "../domain/entities/Instructor";

export class InstructorMapper {
  static toEntity(doc: any): Instructor {
    return new Instructor(
      doc.name,
      doc.email,
      doc.passwordHash,
      doc.jobTitle,
      doc.subject,
      doc.experience,
      doc.socialProfile ,  
      doc.portfolio,                                                                                     
      doc.bio ,
      doc.profilePictureUrl,
      doc.isEmailVerified ,
      doc.accountStatus ,
      doc.approved ,
      doc.rejected,
      doc.rejectedNote,
      doc.approvalNotes,
      doc.doneBy,
      doc.doneAt,
      doc.averageRating ,
      doc.totalReviews ,
      doc._id

    );
  }

  // input
  static toPersistence(entity: Instructor): any {
    return {
      name: entity.name,
      email: entity.email,
      passwordHash: entity.passwordHash,
      subject:entity.subject,
      jobTitle: entity.jobTitle,
      experience: entity.experience,
      socialProfile: entity.socialProfile,
      portfolio: entity.portfolio,
      bio: entity.bio,
      profilePictureUrl: entity.profilePictureUrl,
      isEmailVerified: entity.isEmailVerified,
      accountStatus: entity.accountStatus,
      approved: entity.approved,
      rejected: entity.rejected,
      approvalNotes: entity.approvalNotes,
      approvedBy: entity.doneBy,
      approvedAt: entity.doneAt,
      averageRating: entity.averageRating,
      totalReviews: entity.totalReviews,
    };
  }
}
