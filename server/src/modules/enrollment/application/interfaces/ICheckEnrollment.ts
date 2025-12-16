import { IEnrollment } from '../../infrastructure/models/EnrollmentModel';

export interface ICheckEnrollment {
  execute(userId: string, courseId: string): Promise<IEnrollment | null>;
}
