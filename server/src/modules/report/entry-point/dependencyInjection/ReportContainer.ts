import { ReportController } from '../controllers/ReportController';
import { SubmitReportUseCase } from '../../application/use-cases/SubmitReportUseCase';
import { GetPendingReportsUseCase } from '../../application/use-cases/GetPendingReportsUseCase';
import { DismissReportUseCase } from '../../application/use-cases/DismissReportUseCase';
import { ActionReportUseCase } from '../../application/use-cases/ActionReportUseCase';
import { ReportRepository } from '../../infrastructure/repositories/ReportRepository';
import { CourseRepository } from '../../../course/infrastructure/repositories/CourseRepository';
import { LessonRepository } from '../../../course/infrastructure/repositories/LessonRepository';
import { ReviewRepository } from '../../../review/infrastructure/repositories/ReviewRepository';

const reportRepository = new ReportRepository();
const courseRepository = new CourseRepository();
const lessonRepository = new LessonRepository();
const reviewRepository = new ReviewRepository();

const submitReportUC = new SubmitReportUseCase(reportRepository);
const getPendingReportsUC = new GetPendingReportsUseCase(
  reportRepository,
  courseRepository,
  lessonRepository,
  reviewRepository,
);
const dismissReportUC = new DismissReportUseCase(reportRepository);
const actionReportUC = new ActionReportUseCase(
  reportRepository,
  courseRepository,
  lessonRepository,
  reviewRepository,
);

export const reportController = new ReportController(
  submitReportUC,
  getPendingReportsUC,
  dismissReportUC,
  actionReportUC,
);
