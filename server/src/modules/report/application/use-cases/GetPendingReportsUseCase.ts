import {
  IReportRepository,
  ReportFilterOptions,
} from '../../domain/IRepositories/IReportRepository';
import { IGetPendingReportsUseCase } from '../interfaces/IGetPendingReportsUseCase';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { ILessonRepository } from '../../../course/domain/IRepositories/ILessonRepository';
import { IReviewRepository } from '../../../review/domain/IRepositories/IReviewRepository';
import { ReportMapper } from '../mappers/ReportMapper';
import { PendingReportsResponseDto } from '../dtos/PendingReportsResponseDto';

export class GetPendingReportsUseCase implements IGetPendingReportsUseCase {
  constructor(
    private reportRepository: IReportRepository,
    private courseRepository: ICourseRepository,
    private lessonRepository: ILessonRepository,
    private reviewRepository: IReviewRepository,
  ) {}

  async execute(
    filters: ReportFilterOptions,
  ): Promise<PendingReportsResponseDto> {
    const { reports, total } =
      await this.reportRepository.findWithFilters(filters);

    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        const targetDetails: {
          title?: string;
          comment?: string;
          rating?: number;
        } = {};
        try {
          if (report.targetType === 'course') {
            const course = await this.courseRepository.findById(
              report.targetId,
            );
            if (course) targetDetails.title = course.title;
          } else if (report.targetType === 'lesson') {
            const lesson = await this.lessonRepository.findById(
              report.targetId,
            );
            if (lesson) targetDetails.title = lesson.title;
          } else if (report.targetType === 'review') {
            const review = await this.reviewRepository.findById(
              report.targetId,
            );
            if (review) {
              targetDetails.comment = review.comment;
              targetDetails.rating = review.rating;
            }
          }
        } catch (e) {
          console.error(
            'Error fetching target details for report',
            report._id,
            e,
          );
        }

        report.targetDetails = targetDetails;
        return report;
      }),
    );

    return ReportMapper.toPendingReportsDto(enrichedReports, total);
  }
}
