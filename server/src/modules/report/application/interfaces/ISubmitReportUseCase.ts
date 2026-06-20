import { ReportResponseDto } from '../dtos/ReportResponseDto';

export interface ISubmitReportUseCase {
  execute(
    studentId: string,
    targetType: 'review' | 'course' | 'lesson',
    targetId: string,
    reason: string,
    description?: string,
  ): Promise<ReportResponseDto>;
}
