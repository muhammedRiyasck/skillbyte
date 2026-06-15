// Role: Maps between DTOs and Domain Entities.

import {
  InstructorRegistrationRequestDto,
  InstructorVerifyOtpRequestDto,
  InstructorReapplyRequestDto,
  InstructorProfileUpdateRequestDto,
} from '../dtos/InstructorRequestDto';
import { InstructorResponseDto } from '../dtos/InstructorResponseDto';
import { Instructor } from '../../domain/entities/Instructor';

export class InstructorMapper {
  static toRegisterInstructorEntity(
    dto: InstructorRegistrationRequestDto,
    file?: Express.Multer.File,
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
      resumeFile: file,
    };
  }

  static toVerifyOtpEntity(dto: InstructorVerifyOtpRequestDto) {
    return {
      email: dto.email,
      otp: dto.Otp,
    };
  }

  static toReapplyEntity(dto: InstructorReapplyRequestDto) {
    const { email, ...rest } = dto;
    const updates: Record<string, unknown> = { ...rest };
    if (updates.experience) {
      updates.experience = Number(updates.experience);
    }
    return { email, updates };
  }

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
