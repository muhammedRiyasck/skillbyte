import { INotification } from '../../domain/entities/Notification';

export interface IGetUserNotificationsUseCase {
  execute(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<{ notifications: INotification[]; total: number }>;
}
