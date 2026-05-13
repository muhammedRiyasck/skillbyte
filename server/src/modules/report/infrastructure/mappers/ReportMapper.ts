import { Report } from '../../domain/entities/Report';
import { IReportDoc } from '../models/ReportModel';

export class ReportMapper {
  static toEntity(
    doc: IReportDoc,
    studentInfo?: {
      name: string;
      profilePictureUrl: string;
    },
    targetDetails?: {
      title: string;
      comment: string;
      rating: number;
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
    );
  }
}
