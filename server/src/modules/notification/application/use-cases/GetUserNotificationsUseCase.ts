import { INotificationReadRepository } from '../../domain/IRepositories/INotificationRepository';
import { INotification } from '../../domain/entities/Notification';
import { IGetUserNotificationsUseCase } from '../interfaces/IGetUserNotificationsUseCase';

export class GetUserNotificationsUseCase
  implements IGetUserNotificationsUseCase
{
  constructor(private notificationRepository: INotificationReadRepository) {}

  async execute(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ notifications: INotification[]; total: number }> {
    const result = await this.notificationRepository.paginatedList(
      { userId },
      page,
      limit,
    );
    return {
      notifications: result.data,
      total: result.total,
    };
  }
}
