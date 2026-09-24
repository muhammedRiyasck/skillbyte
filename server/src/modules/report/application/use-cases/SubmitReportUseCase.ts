import { IReportRepository } from '../../domain/IRepositories/IReportRepository';
import { ISubmitReportUseCase } from '../interfaces/ISubmitReportUseCase';
import { ReportMapper } from '../mappers/ReportMapper';
import { ReportResponseDto } from '../dtos/ReportResponseDto';
import { Report } from '../../domain/entities/Report';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/** Executes the business logic for submit report. */
export class SubmitReportUseCase implements ISubmitReportUseCase {
  constructor(private reportRepository: IReportRepository) {}

  /**
   * Execute for the SubmitReport entity.
   *
   * @param reporterId - The unique identifier for the reporter.
   * @param targetType - The target type information.
   * @param targetId - The unique identifier for the target.
   * @param reason - The reason information.
   * @param description - The description information.
   * @param reporterRole - The reporter role information.
   * @returns The standardized HTTP response.
   */
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
