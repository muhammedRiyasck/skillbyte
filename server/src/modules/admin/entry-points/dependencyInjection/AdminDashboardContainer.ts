import { AdminDashboardController } from '../controllers/DashboardController';
import { GetDashboardDataUseCase } from '../../application/use-cases/GetDashboardDataUseCase';
import { TopInstructorRepository } from '../../infrastructure/repositories/TopInstructorRepository';
import { DashboardRepository } from '../../infrastructure/repositories/DashboardRepository';

const topInstructorRepository = new TopInstructorRepository();
const dashboardRepository = new DashboardRepository();
const getDashboardDataUC = new GetDashboardDataUseCase(
  dashboardRepository,
  topInstructorRepository,
);
export const adminDashboardContainer = new AdminDashboardController(
  getDashboardDataUC,
);
