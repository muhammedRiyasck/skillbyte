import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IReportRepository } from '../../domain/IRepositories/IReportRepository';
import { Report } from '../../domain/entities/Report';
import { ReportModel, IReportDoc } from '../models/ReportModel';
import { ReportMapper } from '../../application/mappers/ReportMapper';
import mongoose from 'mongoose';

export class ReportRepository
  extends BaseRepository<Report, IReportDoc>
  implements IReportRepository
{
  constructor() {
    super(ReportModel);
  }

  toEntity(doc: IReportDoc): Report {
    return ReportMapper.toEntity(doc);
  }

  async findByStatus(
    status: 'pending' | 'dismissed' | 'actioned',
    page: number,
    limit: number,
  ): Promise<{ reports: Report[]; total: number }> {
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.model
        .find({ status })
        .populate('reportedBy', 'name profilePictureUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments({ status }),
    ]);

    // For each doc, map the populated student info
    const reports = docs.map((document) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = document as any;
      const isPopulated = doc.reportedBy && typeof doc.reportedBy === 'object';

      const studentInfo = isPopulated
        ? {
            name: doc.reportedBy.name || 'Unknown Student',
            profilePictureUrl: doc.reportedBy.profilePictureUrl,
          }
        : undefined;

      // Ensure we convert _id back to expected types to avoid map errors
      const reportedById = isPopulated
        ? doc.reportedBy._id
        : doc.reportedBy || new mongoose.Types.ObjectId();

      const safeDoc = {
        ...doc,
        reportedBy: reportedById,
      } as IReportDoc;

      return ReportMapper.toEntity(safeDoc, studentInfo);
    });

    return { reports, total };
  }

  async hasUserReportedTarget(
    studentId: string,
    targetType: string,
    targetId: string,
  ): Promise<boolean> {
    const count = await this.model.countDocuments({
      reportedBy: new mongoose.Types.ObjectId(studentId),
      targetType,
      targetId,
    });
    return count > 0;
  }

  async updateStatus(
    reportId: string,
    status: 'pending' | 'dismissed' | 'actioned',
  ): Promise<void> {
    await this.model.findByIdAndUpdate(reportId, { status });
  }

  async deleteManyByTarget(
    targetType: string,
    targetId: string,
  ): Promise<void> {
    await this.model.deleteMany({ targetType, targetId });
  }
}
