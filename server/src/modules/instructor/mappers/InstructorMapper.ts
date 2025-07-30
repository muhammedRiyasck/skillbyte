import { InstructorModel } from "../infrastructure/models/InstructorModel"
import { Instructor } from "../domain/entities/Instructor";

export class InstructorMapper {
  static toEntity(doc: any): Instructor {
    return new Instructor(
      // doc._id.toString(),
      doc.name,
      doc.email,
      doc.passwordHash,
      doc.bio ?? null,
      doc.profilePictureUrl ?? null,
      doc.socialLinks ?? {},
      doc.expertise ?? [],
      doc.isEmailVerified ?? true,
      doc.qualifications ?? [],
      doc.accountStatus ?? "active",
      doc.approved ?? false,
      doc.approvalNotes ?? null,
      doc.approvedBy ?? null,
      doc.approvedAt ?? null,
      doc.averageRating ?? 0,
      doc.totalReviews ?? 0
    );
  }

  static toPersistence(entity: Instructor): any {
    return {
      // _id: entity._id,
      name: entity.name,
      email: entity.email,
      passwordHash: entity.passwordHash,
      bio: entity.bio,
      profilePictureUrl: entity.profilePictureUrl,
      socialLinks: entity.socialLinks,
      expertise: entity.expertise,
      isEmailVerified: entity.isEmailVerified,
      qualifications: entity.qualifications,
      accountStatus: entity.accountStatus,
      approved: entity.approved,
      approvalNotes: entity.approvalNotes,
      approvedBy: entity.approvedBy,
      approvedAt: entity.approvedAt,
      averageRating: entity.averageRating,
      totalReviews: entity.totalReviews,
    };
  }
}
