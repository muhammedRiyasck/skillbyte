import { Report } from '../../domain/entities/Report';
import { ReportResponseDto } from '../dtos/ReportResponseDto';
import { PendingReportsResponseDto } from '../dtos/PendingReportsResponseDto';

export class ReportMapper {
  static toDto(entity: Report): ReportResponseDto {
    return {
      id: entity._id!,
      studentId: entity.reportedBy,
      targetType: entity.targetType,
      targetId: entity.targetId,
      targetDetails: entity.targetDetails,
      reason: entity.reason,
      description: entity.description,
      status: entity.status,
      createdAt: entity.createdAt!,
      updatedAt: entity.updatedAt!,
    };
  }

  static toPendingReportsDto(
    reports: Report[],
    total: number,
  ): PendingReportsResponseDto {
    return {
      reports: reports.map(ReportMapper.toDto),
      total,
    };
  }
}
