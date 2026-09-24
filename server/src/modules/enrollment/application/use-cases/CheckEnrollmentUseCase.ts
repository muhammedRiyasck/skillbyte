import { ICheckEnrollmentUseCase } from '../interfaces/ICheckEnrollment';
import { IEnrollmentReadRepository } from '../../domain/IRepositories/IEnrollmentReadRepository';
import { EnrollmentMapper } from '../mappers/EnrollmentMapper';
import { EnrollmentResponseDto } from '../dtos/EnrollmentResponseDto';

/** Executes the business logic for check enrollment. */
export class CheckEnrollmentUseCase implements ICheckEnrollmentUseCase {
  constructor(private enrollmentRepository: IEnrollmentReadRepository) {}

  /**
   * Execute for the CheckEnrollment entity.
   *
   * @param userId - The unique identifier for the user.
   * @param courseId - The unique identifier for the course.
   * @returns The standardized HTTP response.
   */
  async execute(
    userId: string,
    courseId: string,
  ): Promise<EnrollmentResponseDto | null> {
    const enrollment = await this.enrollmentRepository.findEnrollment(
      userId,
      courseId,
    );
    return enrollment ? EnrollmentMapper.toDto(enrollment) : null;
  }
}
