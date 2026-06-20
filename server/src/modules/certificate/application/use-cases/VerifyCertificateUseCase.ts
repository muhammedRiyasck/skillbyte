import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { IStudentRepository } from '../../../student/domain/IRepositories/IStudentRepository';
import { ICertificateRepository } from '../../domain/IRepositories/ICertificateRepository';
import { CertificateResponseDto } from '../dtos/CertificateResponseDto';
import { IVerifyCertificateUseCase } from '../interfaces/IVerifyCertificateUseCase';
import { CertificateMapper } from '../mappers/CertificateMapper';

export class VerifyCertificateUseCase implements IVerifyCertificateUseCase {
  constructor(
    private certificateRepo: ICertificateRepository,
    private studentRepo: IStudentRepository,
    private courseRepo: ICourseRepository,
    private instructorRepo: IInstructorRepository,
    private enrollmentReadRepo: IEnrollmentReadRepository,
  ) {}

  async execute(verificationCode: string): Promise<CertificateResponseDto> {
    const certificate =
      await this.certificateRepo.findByVerificationCode(verificationCode);

    if (!certificate) {
      throw new HttpError('Certificate not found', HttpStatusCode.NOT_FOUND);
    }

    // Orchestrate fetching related details
    const [student, course, enrollment] = await Promise.all([
      this.studentRepo.findById(certificate.userId),
      this.courseRepo.findById(certificate.courseId),
      this.enrollmentReadRepo.findEnrollment(
        certificate.userId,
        certificate.courseId,
      ),
    ]);

    if (!student || !course || !enrollment) {
      throw new HttpError(
        'Certificate details could not be found',
        HttpStatusCode.NOT_FOUND,
      );
    }

    const instructor = await this.instructorRepo.findById(course.instructorId);
    if (!instructor) {
      throw new HttpError('Instructor not found', HttpStatusCode.NOT_FOUND);
    }

    // Shaping via pure mapper
    return CertificateMapper.toDto(
      certificate,
      student,
      course,
      enrollment,
      instructor,
    );
  }
}
