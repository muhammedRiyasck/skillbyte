import { Report } from '../../domain/entities/Report';

export interface ISubmitReportUseCase {
  execute(
    studentId: string,
    targetType: 'review' | 'course' | 'lesson',
    targetId: string,
    reason: string,
    description?: string,
  ): Promise<Report>;
}
