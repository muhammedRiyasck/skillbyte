import { InstructorModel } from "../infrastructure/models/InstructorModel"
import { Instructor } from "../domain/entities/Instructor";

export class InstructorMapper {
  static toEntity(doc: any): Instructor {
    return new Instructor(
      doc.name,
      doc.email,
      doc.passwordHash,
      doc.subject,
      doc.jobTitle,
      doc.experience,
      doc.socialProfile ,  
      doc.portfolio,                                                                                     
      doc.bio ,
      doc.profilePictureUrl,
      doc.isEmailVerified ,
      doc.accountStatus ,
      doc.approved ,
      doc.rejected,
      doc.approvalNotes,
      doc.approvedBy,
      doc.approvedAt,
      doc.averageRating ,
      doc.totalReviews 
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
      approvedBy: entity.approvedBy,
      approvedAt: entity.approvedAt,
      averageRating: entity.averageRating,
      totalReviews: entity.totalReviews,
    };
  }
}
