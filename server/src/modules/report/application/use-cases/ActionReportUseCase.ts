import { IReportRepository } from '../../domain/IRepositories/IReportRepository';
import { IActionReportUseCase } from '../interfaces/IActionReportUseCase';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { ILessonRepository } from '../../../course/domain/IRepositories/ILessonRepository';
import { IReviewRepository } from '../../../review/domain/IRepositories/IReviewRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class ActionReportUseCase implements IActionReportUseCase {
  constructor(
    private reportRepository: IReportRepository,
    private courseRepository: ICourseRepository,
    private lessonRepository: ILessonRepository,
    private reviewRepository: IReviewRepository,
  ) {}

  async execute(reportId: string): Promise<void> {
    const report = await this.reportRepository.findById(reportId);
    if (!report)
      throw new HttpError('Report not found', HttpStatusCode.NOT_FOUND);
    if (report.status !== 'pending')
      throw new HttpError(
        'Report is already processed',
        HttpStatusCode.BAD_REQUEST,
      );

    if (report.targetType === 'course') {
      await this.courseRepository.blockCourse(report.targetId, true);
    } else if (report.targetType === 'lesson') {
      await this.lessonRepository.updateLessonById(report.targetId, {
        isBlocked: true,
      });
    } else if (report.targetType === 'review') {
      await this.reviewRepository.hideReview(report.targetId);
      // Soft-deleting the review resolves all pending reports for it.
      await this.reportRepository.deleteManyByTarget('review', report.targetId);
    }

    await this.reportRepository.updateStatus(reportId, 'actioned');
  }
}
