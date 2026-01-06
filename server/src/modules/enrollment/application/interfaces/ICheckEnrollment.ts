import { IEnrollment } from '../../domain/entities/Enrollment';

export interface ICheckEnrollment {
  execute(userId: string, courseId: string): Promise<IEnrollment | null>;
}
