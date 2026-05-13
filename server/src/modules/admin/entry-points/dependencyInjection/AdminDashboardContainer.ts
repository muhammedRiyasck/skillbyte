import { AdminDashboardController } from '../controllers/DashboardController';
import { GetDashboardDataUseCase } from '../../application/use-cases/GetDashboardDataUseCase';
import { TopInstructorRepository } from '../../infrastructure/repositories/TopInstructorRepository';

const topInstructorRepository = new TopInstructorRepository();
const getDashboardDataUC = new GetDashboardDataUseCase(topInstructorRepository);
export const adminDashboardContainer = new AdminDashboardController(
  getDashboardDataUC,
);
