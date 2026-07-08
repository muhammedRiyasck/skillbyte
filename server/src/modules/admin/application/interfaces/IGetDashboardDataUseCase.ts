import { AdminDashboardResponseDto } from '../dtos/AdminResponseDto';

export interface IGetDashboardDataUseCase {
  execute(): Promise<AdminDashboardResponseDto>;
}
