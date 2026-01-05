import { INotification } from '../../domain/entities/Notification';

export interface IGetRecentNotificationsUseCase {
  execute(userId: string, limit?: number): Promise<INotification[]>;
}
