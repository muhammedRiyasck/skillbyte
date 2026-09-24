import { Report } from '../../domain/entities/Report';
import { IReportDoc } from '../models/ReportModel';

/** Handles report mapper functionality. */
export class ReportMapper {
  /**
   * To entity for the ReportMapper entity.
   *
   * @param doc - The doc information.
   * @param studentInfo - The student info information.
   * @param targetDetails - The target details information.
   * @param reporterRole - The reporter role information.
   * @param instructorInfo - The instructor info information.
   * @returns The result of the operation.
   */
  static toEntity(
    doc: IReportDoc,
    studentInfo?: {
      name: string;
      profilePictureUrl?: string;
    },
    targetDetails?: {
      title?: string;
      comment?: string;
      rating?: number;
    },
    reporterRole: 'student' | 'instructor' = 'student',
    instructorInfo?: {
      name: string;
      profilePictureUrl?: string;
    },
  ): Report {
    return new Report(
      doc.reportedBy.toString(),
      doc.targetType,
      doc.targetId.toString(),
      doc.reason,
      doc.description,
      doc.status,
      doc._id.toString(),
      doc.createdAt,
      doc.updatedAt,
      studentInfo,
      targetDetails,
      reporterRole,
      instructorInfo,
    );
  }
}
