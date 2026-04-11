import { AdminDashboardController } from '../controllers/DashboardController';
import { GetDashboardDataUseCase } from '../../application/use-cases/GetDashboardDataUseCase';

const getDashboardDataUC = new GetDashboardDataUseCase();
export const adminDashboardContainer = new AdminDashboardController(
  getDashboardDataUC,
);
