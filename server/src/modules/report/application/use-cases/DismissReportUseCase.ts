import { IReportRepository } from '../../domain/IRepositories/IReportRepository';
import { IDismissReportUseCase } from '../interfaces/IDismissReportUseCase';

/** Executes the business logic for dismiss report. */
export class DismissReportUseCase implements IDismissReportUseCase {
  constructor(private reportRepository: IReportRepository) {}

  /**
   * Execute for the DismissReport entity.
   *
   * @param reportId - The unique identifier for the report.
   */
  async execute(reportId: string): Promise<void> {
    await this.reportRepository.updateStatus(reportId, 'dismissed');
  }
}
