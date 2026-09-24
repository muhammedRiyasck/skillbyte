import { Report } from '../../domain/entities/Report';
import { ReportResponseDto } from '../dtos/ReportResponseDto';
import { PendingReportsResponseDto } from '../dtos/PendingReportsResponseDto';

/** Handles report mapper functionality. */
export class ReportMapper {
  /**
   * To dto for the ReportMapper entity.
   *
   * @param entity - The entity information.
   * @returns The standardized HTTP response.
   */
  static toDto(entity: Report): ReportResponseDto {
    return {
      _id: entity._id!,
      studentId: entity.reportedBy,
      studentInfo: entity.studentInfo,
      reporterRole: entity.reporterRole,
      instructorInfo: entity.instructorInfo,
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

  /**
   * To pending reports dto for the ReportMapper entity.
   *
   * @param reports - The reports information.
   * @param total - The total information.
   * @returns The standardized HTTP response.
   */
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
