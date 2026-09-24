import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import {
  IReportRepository,
  ReportFilterOptions,
} from '../../domain/IRepositories/IReportRepository';
import { Report } from '../../domain/entities/Report';
import { ReportModel, IReportDoc } from '../models/ReportModel';
import { ReportMapper } from '../mappers/ReportMapper';
import mongoose from 'mongoose';

/** Shape of a populated reporter sub-document after Mongoose .populate() */
interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name?: string;
  profilePictureUrl?: string;
}

/** IReportDoc with its reference fields optionally populated */
interface PopulatedReportDoc
  extends Omit<IReportDoc, 'reportedBy' | 'instructorId'> {
  reportedBy: mongoose.Types.ObjectId | PopulatedUser;
  instructorId?: mongoose.Types.ObjectId | PopulatedUser;
  reporterRole: 'student' | 'instructor';
}

/** Data written to MongoDB when creating a new Report */
interface ReportSaveData {
  reportedBy?: string;
  instructorId?: string;
  reporterRole: 'student' | 'instructor';
  targetType: IReportDoc['targetType'];
  targetId: IReportDoc['targetId'];
  reason: string;
  description?: string;
  status: IReportDoc['status'];
}

/** Manages database operations for report. */
export class ReportRepository
  extends BaseRepository<Report, IReportDoc>
  implements IReportRepository
{
  constructor() {
    super(ReportModel);
  }

  /**
   * Save for the Report entity.
   *
   * @param entity - The entity information.
   * @returns The result of the operation.
   */
  override async save(entity: Report): Promise<Report> {
    const data: ReportSaveData = {
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

  /**
   * To entity for the Report entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  toEntity(doc: IReportDoc): Report {
    return ReportMapper.toEntity(doc);
  }

  private mapDocs(docs: IReportDoc[]): Report[] {
    return docs.map((document) => {
      const doc = document as PopulatedReportDoc;
      const reporterRole: 'student' | 'instructor' =
        doc.reporterRole ?? 'student';

      // Resolve reporter info based on role
      let studentInfo: { name: string; profilePictureUrl?: string } | undefined;
      let instructorInfo:
        | { name: string; profilePictureUrl?: string }
        | undefined;
      let reportedById: mongoose.Types.ObjectId;

      if (reporterRole === 'instructor') {
        const populated =
          doc.instructorId && 'name' in doc.instructorId
            ? (doc.instructorId as PopulatedUser)
            : undefined;
        if (populated) {
          instructorInfo = {
            name: populated.name || 'Unknown Instructor',
            profilePictureUrl: populated.profilePictureUrl,
          };
          reportedById = populated._id;
        } else {
          reportedById =
            (doc.instructorId as mongoose.Types.ObjectId | undefined) ||
            new mongoose.Types.ObjectId();
        }
      } else {
        const populated =
          doc.reportedBy && 'name' in doc.reportedBy
            ? (doc.reportedBy as PopulatedUser)
            : undefined;
        if (populated) {
          studentInfo = {
            name: populated.name || 'Unknown Student',
            profilePictureUrl: populated.profilePictureUrl,
          };
          reportedById = populated._id;
        } else {
          reportedById =
            (doc.reportedBy as mongoose.Types.ObjectId) ||
            new mongoose.Types.ObjectId();
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

  /**
   * Find by status for the Report entity.
   *
   * @param status - The status information.
   * @param page - The page information.
   * @param limit - The limit information.
   * @returns The result of the operation.
   */
  async findByStatus(
    status: 'pending' | 'dismissed' | 'actioned',
    page: number,
    limit: number,
  ): Promise<{ reports: Report[]; total: number }> {
    return this.findWithFilters({ status, page, limit });
  }

  /**
   * Find with filters for the Report entity.
   *
   * @param filters - The filters information.
   * @returns The result of the operation.
   */
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

  /**
   * Has user reported target for the Report entity.
   *
   * @param reporterId - The unique identifier for the reporter.
   * @param targetType - The target type information.
   * @param targetId - The unique identifier for the target.
   * @returns The result of the operation.
   */
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

  /**
   * Update status for the Report entity.
   *
   * @param reportId - The unique identifier for the report.
   * @param status - The status information.
   */
  async updateStatus(
    reportId: string,
    status: 'pending' | 'dismissed' | 'actioned',
  ): Promise<void> {
    await this.model.findByIdAndUpdate(reportId, { status });
  }

  /**
   * Delete many by target for the Report entity.
   *
   * @param targetType - The target type information.
   * @param targetId - The unique identifier for the target.
   */
  async deleteManyByTarget(
    targetType: string,
    targetId: string,
  ): Promise<void> {
    await this.model.deleteMany({ targetType, targetId });
  }
}
