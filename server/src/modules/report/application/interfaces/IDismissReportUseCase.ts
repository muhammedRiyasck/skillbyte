export interface IDismissReportUseCase {
  execute(reportId: string): Promise<void>;
}
