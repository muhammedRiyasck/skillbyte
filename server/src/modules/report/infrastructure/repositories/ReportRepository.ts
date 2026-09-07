import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import {
  IReportRepository,
  ReportFilterOptions,
} from '../../domain/IRepositories/IReportRepository';
import { Report } from '../../domain/entities/Report';
import { ReportModel, IReportDoc } from '../models/ReportModel';
import { ReportMapper } from '../mappers/ReportMapper';
import mongoose from 'mongoose';

export class ReportRepository
  extends BaseRepository<Report, IReportDoc>
  implements IReportRepository
{
  constructor() {
    super(ReportModel);
  }

  override async save(entity: Report): Promise<Report> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {
      reportedBy:
        entity.reporterRole === 'student' ? entity.reportedBy : undefined,
      instructorId:
        entity.reporterRole === 'instructor' ? entity.reportedBy : undefined,
      reporterRole: entity.reporterRole,
      targetType: entity.targetType,
      targetId: entity.targetId,
      reason: entity.reason,
      description: entity.description,
      status: entity.status,
    };

    // reportedBy is required by schema — use a fallback for instructor reports
    if (entity.reporterRole === 'instructor') {
      data.reportedBy = entity.reportedBy; // reuse same ID in reportedBy field too
    }

    const created = await ReportModel.create(data);
    return this.toEntity(created);
  }

  toEntity(doc: IReportDoc): Report {
    return ReportMapper.toEntity(doc);
  }

  private mapDocs(docs: IReportDoc[]): Report[] {
    return docs.map((document) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = document as any;
      const reporterRole: 'student' | 'instructor' =
        doc.reporterRole ?? 'student';

      // Resolve reporter info based on role
      let studentInfo: { name: string; profilePictureUrl?: string } | undefined;
      let instructorInfo:
        | { name: string; profilePictureUrl?: string }
        | undefined;
      let reportedById: mongoose.Types.ObjectId;

      if (reporterRole === 'instructor') {
        const isPopulated =
          doc.instructorId && typeof doc.instructorId === 'object';
        if (isPopulated) {
          instructorInfo = {
            name: doc.instructorId.name || 'Unknown Instructor',
            profilePictureUrl: doc.instructorId.profilePictureUrl,
          };
          reportedById = doc.instructorId._id;
        } else {
          reportedById = doc.instructorId || new mongoose.Types.ObjectId();
        }
      } else {
        const isPopulated =
          doc.reportedBy && typeof doc.reportedBy === 'object';
        if (isPopulated) {
          studentInfo = {
            name: doc.reportedBy.name || 'Unknown Student',
            profilePictureUrl: doc.reportedBy.profilePictureUrl,
          };
          reportedById = doc.reportedBy._id;
        } else {
          reportedById = doc.reportedBy || new mongoose.Types.ObjectId();
        }
      }

      const safeDoc = {
        ...doc,
        reportedBy: reportedById,
      } as IReportDoc;

      return ReportMapper.toEntity(
        safeDoc,
        studentInfo,
        undefined,
        reporterRole,
        instructorInfo,
      );
    });
  }

  /** Convenience wrapper kept for backwards compat */
  async findByStatus(
    status: 'pending' | 'dismissed' | 'actioned',
    page: number,
    limit: number,
  ): Promise<{ reports: Report[]; total: number }> {
    return this.findWithFilters({ status, page, limit });
  }

  async findWithFilters(
    filters: ReportFilterOptions,
  ): Promise<{ reports: Report[]; total: number }> {
    const {
      status,
      targetType,
      reporterRole,
      reason,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page,
      limit,
    } = filters;

    const skip = (page - 1) * limit;

    // Build dynamic filter query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (status) query.status = status;
    if (targetType) query.targetType = targetType;
    if (reporterRole) query.reporterRole = reporterRole;
    if (reason) query.reason = { $regex: reason, $options: 'i' };

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    const sortValue = sortOrder === 'asc' ? 1 : -1;

    const [docs, total] = await Promise.all([
      this.model
        .find(query)
        .populate('reportedBy', 'name profilePictureUrl')
        .populate('instructorId', 'name profilePictureUrl')
        .sort({ [sortBy]: sortValue })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(query),
    ]);

    return { reports: this.mapDocs(docs as IReportDoc[]), total };
  }

  async hasUserReportedTarget(
    reporterId: string,
    targetType: string,
    targetId: string,
  ): Promise<boolean> {
    const count = await this.model.countDocuments({
      $or: [
        { reportedBy: new mongoose.Types.ObjectId(reporterId) },
        { instructorId: new mongoose.Types.ObjectId(reporterId) },
      ],
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
