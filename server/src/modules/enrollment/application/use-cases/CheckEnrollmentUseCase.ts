import { IEnrollmentReadRepository } from '../../domain/IRepositories/IEnrollmentReadRepository';
import { ICheckEnrollment } from '../interfaces/ICheckEnrollment';

export class CheckEnrollmentUseCase implements ICheckEnrollment {
  constructor(private enrollmentRepository: IEnrollmentReadRepository) {}
  async execute(userId: string, courseId: string) {
    const enrollment = await this.enrollmentRepository.findEnrollment(
      userId,
      courseId,
    );
    return enrollment;
  }
}
