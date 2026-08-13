import { ICheckEnrollmentUseCase } from '../interfaces/ICheckEnrollment';
import { IEnrollmentReadRepository } from '../../domain/IRepositories/IEnrollmentReadRepository';
import { EnrollmentMapper } from '../mappers/EnrollmentMapper';
import { EnrollmentResponseDto } from '../dtos/EnrollmentResponseDto';

export class CheckEnrollmentUseCase implements ICheckEnrollmentUseCase {
  constructor(private enrollmentRepository: IEnrollmentReadRepository) {}

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
