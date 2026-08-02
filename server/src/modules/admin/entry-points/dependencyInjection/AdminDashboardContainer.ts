import { AdminDashboardController } from '../controllers/DashboardController';
import { GetDashboardDataUseCase } from '../../application/use-cases/GetDashboardDataUseCase';
import { GetRevenueTrendByYearUseCase } from '../../application/use-cases/GetRevenueTrendByYearUseCase';
import { TopInstructorRepository } from '../../infrastructure/repositories/TopInstructorRepository';
import { DashboardRepository } from '../../infrastructure/repositories/DashboardRepository';

const topInstructorRepository = new TopInstructorRepository();
const dashboardRepository = new DashboardRepository();
const getDashboardDataUC = new GetDashboardDataUseCase(
  dashboardRepository,
  topInstructorRepository,
);
const getRevenueTrendByYearUC = new GetRevenueTrendByYearUseCase(
  dashboardRepository,
);

export const adminDashboardContainer = new AdminDashboardController(
  getDashboardDataUC,
  getRevenueTrendByYearUC,
);
