import { EnrollmentStatus } from '../../../../shared/enums/EnrollmentStatus';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { IStudentRepository } from '../../../student/domain/IRepositories/IStudentRepository';
import { ICertificateRepository } from '../../domain/IRepositories/ICertificateRepository';
import { CertificateDto } from '../dtos/CertificateDto';
import { ICertificateCodeGenerator } from '../interfaces/ICertificateCodeGenerator';
import { IIssueCertificateUseCase } from '../interfaces/IIssueCertificateUseCase';
import { CertificateMapper } from './CertificateMapper';

export class IssueCertificateUseCase implements IIssueCertificateUseCase {
  constructor(
    private certificateRepo: ICertificateRepository,
    private enrollmentReadRepo: IEnrollmentReadRepository,
    private studentRepo: IStudentRepository,
    private courseRepo: ICourseRepository,
    private instructorRepo: IInstructorRepository,
    private codeGenerator: ICertificateCodeGenerator,
  ) {}

  async execute(userId: string, courseId: string): Promise<CertificateDto> {
    const enrollment = await this.enrollmentReadRepo.findEnrollment(
      userId,
      courseId,
    );

    if (!enrollment || !enrollment.enrollmentId) {
      throw new HttpError(
        'You are not enrolled in this course',
        HttpStatusCode.FORBIDDEN,
      );
    }

    if (
      enrollment.status !== EnrollmentStatus.COMPLETED ||
      enrollment.progress < 100
    ) {
      throw new HttpError(
        'Complete all lessons before claiming your certificate',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    let certificate = await this.certificateRepo.findByEnrollmentId(
      enrollment.enrollmentId,
    );

    if (!certificate) {
      certificate = await this.certificateRepo.save({
        enrollmentId: enrollment.enrollmentId,
        userId,
        courseId,
        certificateNumber: this.codeGenerator.generateCertificateNumber(),
        verificationCode: this.codeGenerator.generateVerificationCode(),
        issuedAt: new Date(),
      });
    }

    // Orchestrate fetching related details
    const [student, course] = await Promise.all([
      this.studentRepo.findById(userId),
      this.courseRepo.findById(courseId),
    ]);

    if (!student || !course) {
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
