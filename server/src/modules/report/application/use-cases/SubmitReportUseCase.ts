import { IReportRepository } from '../../domain/IRepositories/IReportRepository';
import { ISubmitReportUseCase } from '../interfaces/ISubmitReportUseCase';
import { Report } from '../../domain/entities/Report';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class SubmitReportUseCase implements ISubmitReportUseCase {
  constructor(private reportRepository: IReportRepository) {}

  async execute(
    studentId: string,
    targetType: 'review' | 'course' | 'lesson',
    targetId: string,
    reason: string,
    description?: string,
  ): Promise<Report> {
    const hasReported = await this.reportRepository.hasUserReportedTarget(
      studentId,
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
      studentId,
      targetType,
      targetId,
      reason,
      description,
    );

    return this.reportRepository.save(report);
  }
}
