export interface IActionReportUseCase {
  execute(reportId: string): Promise<void>;
}
