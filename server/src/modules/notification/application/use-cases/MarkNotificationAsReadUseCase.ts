import { INotificationWriteRepository } from '../../domain/IRepositories/INotificationRepository';
import { INotification } from '../../domain/entities/Notification';
import { IMarkNotificationAsReadUseCase } from '../interfaces/IMarkNotificationAsReadUseCase';

export class MarkNotificationAsReadUseCase
  implements IMarkNotificationAsReadUseCase
{
  constructor(private notificationRepository: INotificationWriteRepository) {}

  async execute(notificationId: string): Promise<INotification | null> {
    return this.notificationRepository.markAsRead(notificationId);
  }
}
