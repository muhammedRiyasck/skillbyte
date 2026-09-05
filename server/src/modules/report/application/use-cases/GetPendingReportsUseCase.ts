import {
  IReportRepository,
  ReportFilterOptions,
} from '../../domain/IRepositories/IReportRepository';
import { IGetPendingReportsUseCase } from '../interfaces/IGetPendingReportsUseCase';
import { TargetDetailStrategyRegistry } from '../strategies/TargetDetailStrategyRegistry';
import { TargetDetails } from '../strategies/ITargetDetailStrategy';
import { ReportMapper } from '../mappers/ReportMapper';
import { PendingReportsResponseDto } from '../dtos/PendingReportsResponseDto';

export class GetPendingReportsUseCase implements IGetPendingReportsUseCase {
  constructor(
    private reportRepository: IReportRepository,
    private targetDetailRegistry: TargetDetailStrategyRegistry,
  ) {}

  async execute(
    filters: ReportFilterOptions,
  ): Promise<PendingReportsResponseDto> {
    const { reports, total } =
      await this.reportRepository.findWithFilters(filters);

    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        let targetDetails: TargetDetails = {};
        try {
          const strategy = this.targetDetailRegistry.get(report.targetType);
          if (strategy) {
            const details = await strategy.fetchDetails(report.targetId);
            if (details) {
              targetDetails = details;
            }
          }
        } catch (e) {
          console.error(
            'Error fetching target details for report',
            report._id,
            e,
          );
        }

        report.targetDetails = targetDetails;
        return report;
      }),
    );

    return ReportMapper.toPendingReportsDto(enrichedReports, total);
  }
}
