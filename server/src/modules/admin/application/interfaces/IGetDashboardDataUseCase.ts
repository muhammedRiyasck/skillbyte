import { IAdminDashboardData } from '../../domain/interfaces/IDashboardData';

export { IAdminDashboardData };

export interface IGetDashboardDataUseCase {
  execute(): Promise<IAdminDashboardData>;
}
