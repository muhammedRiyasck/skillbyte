import { ReportController } from '../controllers/ReportController';
import { SubmitReportUseCase } from '../../application/use-cases/SubmitReportUseCase';
import { GetPendingReportsUseCase } from '../../application/use-cases/GetPendingReportsUseCase';
import { DismissReportUseCase } from '../../application/use-cases/DismissReportUseCase';
import { ActionReportUseCase } from '../../application/use-cases/ActionReportUseCase';
import { ReportRepository } from '../../infrastructure/repositories/ReportRepository';
import { CourseRepository } from '../../../course/infrastructure/repositories/CourseRepository';
import { LessonRepository } from '../../../course/infrastructure/repositories/LessonRepository';
import { ReviewRepository } from '../../../review/infrastructure/repositories/ReviewRepository';

import { ReportActionStrategyRegistry } from '../../application/strategies/ReportActionStrategyRegistry';
import { CourseReportActionStrategy } from '../../application/strategies/CourseReportActionStrategy';
import { LessonReportActionStrategy } from '../../application/strategies/LessonReportActionStrategy';
import { ReviewReportActionStrategy } from '../../application/strategies/ReviewReportActionStrategy';

import { TargetDetailStrategyRegistry } from '../../application/strategies/TargetDetailStrategyRegistry';
import { CourseTargetDetailStrategy } from '../../application/strategies/CourseTargetDetailStrategy';
import { LessonTargetDetailStrategy } from '../../application/strategies/LessonTargetDetailStrategy';
import { ReviewTargetDetailStrategy } from '../../application/strategies/ReviewTargetDetailStrategy';

const reportRepository = new ReportRepository();
const courseRepository = new CourseRepository();
const lessonRepository = new LessonRepository();
const reviewRepository = new ReviewRepository();

// Setup Action Strategy Registry (OCP)
const actionStrategyRegistry = new ReportActionStrategyRegistry();
actionStrategyRegistry.register(
  new CourseReportActionStrategy(courseRepository),
);
actionStrategyRegistry.register(
  new LessonReportActionStrategy(lessonRepository),
);
actionStrategyRegistry.register(
  new ReviewReportActionStrategy(reviewRepository, reportRepository),
);

// Setup Target Detail Strategy Registry (OCP)
const targetDetailStrategyRegistry = new TargetDetailStrategyRegistry();
targetDetailStrategyRegistry.register(
  new CourseTargetDetailStrategy(courseRepository),
);
targetDetailStrategyRegistry.register(
  new LessonTargetDetailStrategy(lessonRepository),
);
targetDetailStrategyRegistry.register(
  new ReviewTargetDetailStrategy(reviewRepository),
);

const submitReportUC = new SubmitReportUseCase(reportRepository);
const getPendingReportsUC = new GetPendingReportsUseCase(
  reportRepository,
  targetDetailStrategyRegistry,
);
const dismissReportUC = new DismissReportUseCase(reportRepository);
const actionReportUC = new ActionReportUseCase(
  reportRepository,
  actionStrategyRegistry,
);

export const reportController = new ReportController(
  submitReportUC,
  getPendingReportsUC,
  dismissReportUC,
  actionReportUC,
);
