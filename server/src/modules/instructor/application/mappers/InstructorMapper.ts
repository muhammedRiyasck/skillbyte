import {
  InstructorRegistrationDto,
  InstructorVerifyOtpDto,
  InstructorReapplyDto,
  InstructorProfileUpdateDto,
} from '../dtos/InstructorDtos';

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
}
