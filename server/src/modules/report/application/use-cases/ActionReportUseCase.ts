import { IReportRepository } from '../../domain/IRepositories/IReportRepository';
import { IActionReportUseCase } from '../interfaces/IActionReportUseCase';
import { ReportActionStrategyRegistry } from '../strategies/ReportActionStrategyRegistry';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class ActionReportUseCase implements IActionReportUseCase {
  constructor(
    private reportRepository: IReportRepository,
    private actionStrategyRegistry: ReportActionStrategyRegistry,
  ) {}

  async execute(reportId: string): Promise<void> {
    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new HttpError('Report not found', HttpStatusCode.NOT_FOUND);
    }
    if (report.status !== 'pending') {
      throw new HttpError(
        'Report is already processed',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const strategy = this.actionStrategyRegistry.get(report.targetType);
    if (!strategy) {
      throw new HttpError(
        `No action handler configured for report target type: ${report.targetType}`,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    await strategy.executeAction(report.targetId);
    await this.reportRepository.updateStatus(reportId, 'actioned');
  }
}
