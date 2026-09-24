import { ICertificate } from '../../domain/entities/Certificate';
import { IEnrollment } from '../../../enrollment/domain/entities/Enrollment';
import { CertificateResponseDto } from '../dtos/CertificateResponseDto';
import { Course } from '../../../course/domain/entities/Course';
import { Instructor } from '../../../instructor/domain/entities/Instructor';
import { Student } from '../../../student/domain/entities/Student';

/** Handles certificate mapper functionality. */
export class CertificateMapper {
  /**
   * To dto for the CertificateMapper entity.
   *
   * @param certificate - The certificate information.
   * @param student - The student information.
   * @param course - The course information.
   * @param enrollment - The enrollment information.
   * @param instructor - The instructor information.
   * @returns The standardized HTTP response.
   */
  static toDto(
    certificate: ICertificate,
    student: Student,
    course: Course,
    enrollment: IEnrollment,
    instructor: Instructor,
  ): CertificateResponseDto {
    return {
      certificateId: certificate.certificateId!,
      certificateNumber: certificate.certificateNumber,
      verificationCode: certificate.verificationCode,
      issuedAt: certificate.issuedAt,
      completedAt: enrollment.completedAt,
      student: {
        id: student.studentId!,
        name: student.name,
      },
      course: {
        id: course.courseId!,
        title: course.title,
        category: course.category,
        courseLevel: course.courseLevel,
        duration: course.duration,
      },
      instructor: {
        id: instructor.instructorId!,
        name: instructor.name,
        title: instructor.jobTitle,
      },
    };
  }
}
