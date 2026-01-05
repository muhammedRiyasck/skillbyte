import { INotificationWriteRepository } from '../../domain/IRepositories/INotificationRepository';
import { IMarkAllNotificationsAsReadUseCase } from '../interfaces/IMarkAllNotificationsAsReadUseCase';

export class MarkAllNotificationsAsReadUseCase
  implements IMarkAllNotificationsAsReadUseCase
{
  constructor(private notificationRepository: INotificationWriteRepository) {}

  async execute(userId: string): Promise<void> {
    return this.notificationRepository.markAllAsRead(userId);
  }
}
