// Role: Maps between DTOs and Domain Entities.

import {
  InstructorRegistrationRequestDto,
  InstructorVerifyOtpRequestDto,
  InstructorReapplyRequestDto,
  InstructorProfileUpdateRequestDto,
} from '../dtos/InstructorRequestDto';
import { InstructorResponseDto } from '../dtos/InstructorResponseDto';
import { Instructor } from '../../domain/entities/Instructor';

/** Handles instructor mapper functionality. */
export class InstructorMapper {
  /**
   * To register instructor entity for the InstructorMapper entity.
   *
   * @param dto - The data transfer object containing request details.
   * @param resumeKey - The resume key information.
   */
  static toRegisterInstructorEntity(
    dto: InstructorRegistrationRequestDto,
    resumeKey?: string,
  ) {
    const subject =
      dto.subject.trim() === 'Other' ? dto.customSubject : dto.subject;
    const jobTitle =
      dto.jobTitle.trim() === 'Other' ? dto.customJobTitle : dto.jobTitle;

    return {
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
      phoneNumber: dto.phoneNumber,
      subject: subject || '',
      jobTitle: jobTitle || '',
      socialMediaLink: dto.socialMediaLink,
      experience: dto.experience,
      portfolioLink: dto.portfolioLink,
      bio: dto.bio,
      resumeKey, // plain S3 key, or undefined if upload failed/skipped
    };
  }

  /**
   * To verify otp entity for the InstructorMapper entity.
   *
   * @param dto - The data transfer object containing request details.
   */
  static toVerifyOtpEntity(dto: InstructorVerifyOtpRequestDto) {
    return {
      email: dto.email,
      otp: dto.Otp,
    };
  }

  /**
   * To reapply entity for the InstructorMapper entity.
   *
   * @param dto - The data transfer object containing request details.
   */
  static toReapplyEntity(dto: InstructorReapplyRequestDto) {
    const { email } = dto;
    const updates: Partial<Instructor> = {};

    if (dto.fullName !== undefined) updates.name = dto.fullName;
    if (dto.phoneNumber !== undefined) updates.phoneNumber = dto.phoneNumber;
    if (dto.subject !== undefined) {
      updates.subject =
        dto.subject === 'Other' ? dto.customSubject || '' : dto.subject;
    }
    if (dto.jobTitle !== undefined) {
      updates.jobTitle =
        dto.jobTitle === 'Other' ? dto.customJobTitle || '' : dto.jobTitle;
    }
    if (dto.socialMediaLink !== undefined)
      updates.socialProfile = dto.socialMediaLink;
    if (dto.experience !== undefined)
      updates.experience = Number(dto.experience);
    if (dto.portfolioLink !== undefined) updates.portfolio = dto.portfolioLink;
    if (dto.bio !== undefined) updates.bio = dto.bio;

    return { email, updates };
  }

  /**
   * To update profile entity for the InstructorMapper entity.
   *
   * @param dto - The data transfer object containing request details.
   */
  static toUpdateProfileEntity(dto: InstructorProfileUpdateRequestDto) {
    const updates: Record<string, unknown> = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.phoneNumber !== undefined) updates.phoneNumber = dto.phoneNumber;
    if (dto.subject !== undefined) updates.subject = dto.subject;
    if (dto.jobTitle !== undefined) updates.jobTitle = dto.jobTitle;
    if (dto.socialProfile !== undefined)
      updates.socialProfile = dto.socialProfile;
    if (dto.portfolio !== undefined) updates.portfolio = dto.portfolio;
    if (dto.bio !== undefined) updates.bio = dto.bio;
    if (dto.profilePicture !== undefined)
      updates.profilePictureUrl = dto.profilePicture;
    if (dto.experience !== undefined) {
      updates.experience = Number(dto.experience);
    }
    return updates;
  }

  /**
   * To response dto for the InstructorMapper entity.
   *
   * @param instructor - The instructor information.
   * @returns The standardized HTTP response.
   */
  static toResponseDto(instructor: Instructor): InstructorResponseDto {
    return {
      id: instructor.instructorId,
      name: instructor.name,
      email: instructor.email,
      subject: instructor.subject,
      jobTitle: instructor.jobTitle,
      experience: instructor.experience,
      socialProfile: instructor.socialProfile,
      portfolio: instructor.portfolio,
      bio: instructor.bio,
      phoneNumber: instructor.phoneNumber,
      resumeUrl: instructor.resumeUrl,
      profilePicture: instructor.profilePictureUrl,
      isStripeVerified: instructor.isStripeVerified,
      stripeAccountId: instructor.stripeAccountId,
      isEmailVerified: instructor.isEmailVerified,
      accountStatus: instructor.accountStatus,
      averageRating: instructor.averageRating,
      totalReviews: instructor.totalReviews,
      totalEarnings: instructor.totalEarnings || 0,
      withdrawnAmount: instructor.withdrawnAmount || 0,
      approved: instructor.approved,
      rejected: instructor.rejected,
    };
  }
}
