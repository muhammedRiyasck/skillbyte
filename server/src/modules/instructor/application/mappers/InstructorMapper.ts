// Role: Maps between DTOs (Data Transfer Objects) and Domain Entities.

import {
  InstructorRegistrationDto,
  InstructorVerifyOtpDto,
  InstructorReapplyDto,
  InstructorProfileUpdateDto,
  InstructorResponseDto,
} from '../dtos/InstructorDtos';
import { Instructor } from '../../domain/entities/Instructor';

export class InstructorMapper {
  static toRegisterInstructorEntity(
    dto: InstructorRegistrationDto,
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

  static toVerifyOtpEntity(dto: InstructorVerifyOtpDto) {
    return {
      email: dto.email,
      otp: dto.Otp,
    };
  }

  static toReapplyEntity(dto: InstructorReapplyDto) {
    const { email, ...rest } = dto;
    const updates: Record<string, unknown> = { ...rest };
    if (updates.experience) {
      updates.experience = Number(updates.experience);
    }
    return { email, updates };
  }

  static toUpdateProfileEntity(dto: InstructorProfileUpdateDto) {
    const updates: Record<string, unknown> = { ...dto };
    if (updates.experience) {
      updates.experience = Number(updates.experience);
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
      paypalEmail: instructor.paypalEmail,
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
