import { IReportRepository } from '../../domain/IRepositories/IReportRepository';
import { IDismissReportUseCase } from '../interfaces/IDismissReportUseCase';

export class DismissReportUseCase implements IDismissReportUseCase {
  constructor(private reportRepository: IReportRepository) {}

  async execute(reportId: string): Promise<void> {
    await this.reportRepository.updateStatus(reportId, 'dismissed');
  }
}
