import { CourseRepository } from '../../course/infrastructure/repositories/CourseRepository';
import { EnrollmentReadRepository } from '../../enrollment/infrastructure/repositories/EnrollmentReadRepository';
import { InstructorRepository } from '../../instructor/infrastructure/repositories/InstructorRepository';
import { StudentRepository } from '../../student/infrastructure/repositories/StudentRepository';
import { CertificateCodeGenerator } from '../application/use-cases/CertificateCodeGenerator';
import { GetCertificateUseCase } from '../application/use-cases/GetCertificateUseCase';
import { IssueCertificateUseCase } from '../application/use-cases/IssueCertificateUseCase';
import { VerifyCertificateUseCase } from '../application/use-cases/VerifyCertificateUseCase';
import { CertificateRepository } from '../infrastructure/repositories/CertificateRepository';
import { CertificateController } from './CertificateController';

// Infrastructure
const certificateRepo = new CertificateRepository();
const enrollmentReadRepo = new EnrollmentReadRepository();
const studentRepo = new StudentRepository();
const courseRepo = new CourseRepository();
const instructorRepo = new InstructorRepository();

// Application services
const codeGenerator = new CertificateCodeGenerator();

// Use cases — all depend on interfaces/repositories directly for orchestration
const issueCertificateUc = new IssueCertificateUseCase(
  certificateRepo,
  enrollmentReadRepo,
  studentRepo,
  courseRepo,
  instructorRepo,
  codeGenerator,
);
const getCertificateUc = new GetCertificateUseCase(
  certificateRepo,
  studentRepo,
  courseRepo,
  instructorRepo,
  enrollmentReadRepo,
);
const verifyCertificateUc = new VerifyCertificateUseCase(
  certificateRepo,
  studentRepo,
  courseRepo,
  instructorRepo,
  enrollmentReadRepo,
);

export const certificateController = new CertificateController(
  issueCertificateUc,
  getCertificateUc,
  verifyCertificateUc,
);
