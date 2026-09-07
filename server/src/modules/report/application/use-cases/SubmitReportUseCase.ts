import { IReportRepository } from '../../domain/IRepositories/IReportRepository';
import { ISubmitReportUseCase } from '../interfaces/ISubmitReportUseCase';
import { ReportMapper } from '../mappers/ReportMapper';
import { ReportResponseDto } from '../dtos/ReportResponseDto';
import { Report } from '../../domain/entities/Report';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class SubmitReportUseCase implements ISubmitReportUseCase {
  constructor(private reportRepository: IReportRepository) {}

  async execute(
    reporterId: string,
    targetType: 'review' | 'course' | 'lesson',
    targetId: string,
    reason: string,
    description?: string,
    reporterRole: 'student' | 'instructor' = 'student',
  ): Promise<ReportResponseDto> {
    const hasReported = await this.reportRepository.hasUserReportedTarget(
      reporterId,
      targetType,
      targetId,
    );
    if (hasReported) {
      throw new HttpError(
        'You have already reported this content',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const report = new Report(
      reporterId,
      targetType,
      targetId,
      reason,
      description,
      'pending',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      reporterRole,
    );

    const savedReport = await this.reportRepository.save(report);
    return ReportMapper.toDto(savedReport);
  }
}
