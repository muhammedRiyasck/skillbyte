import { ReportResponseDto } from '../dtos/ReportResponseDto';

export interface ISubmitReportUseCase {
  execute(
    reporterId: string,
    targetType: 'review' | 'course' | 'lesson',
    targetId: string,
    reason: string,
    description?: string,
    reporterRole?: 'student' | 'instructor',
  ): Promise<ReportResponseDto>;
}
