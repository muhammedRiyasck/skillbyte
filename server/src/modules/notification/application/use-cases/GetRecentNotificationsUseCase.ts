import { INotificationReadRepository } from '../../domain/IRepositories/INotificationRepository';
import { INotification } from '../../domain/entities/Notification';
import { IGetRecentNotificationsUseCase } from '../interfaces/IGetRecentNotificationsUseCase';

export class GetRecentNotificationsUseCase
  implements IGetRecentNotificationsUseCase
{
  constructor(private notificationRepository: INotificationReadRepository) {}

  async execute(userId: string, limit: number = 5): Promise<INotification[]> {
    return this.notificationRepository.findByUserId(userId, limit);
  }
}
