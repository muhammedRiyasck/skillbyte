import { ReportResponseDto } from './ReportResponseDto';

export interface PendingReportsResponseDto {
  reports: ReportResponseDto[];
  total: number;
}
