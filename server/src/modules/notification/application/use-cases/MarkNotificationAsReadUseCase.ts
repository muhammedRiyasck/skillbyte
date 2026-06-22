import { INotificationWriteRepository } from '../../domain/IRepositories/INotificationRepository';
import { NotificationMapper } from '../mappers/NotificationMapper';
import { NotificationResponseDto } from '../dtos/NotificationDto';
import { IMarkNotificationAsReadUseCase } from '../interfaces/IMarkNotificationAsReadUseCase';

export class MarkNotificationAsReadUseCase
  implements IMarkNotificationAsReadUseCase
{
  constructor(private notificationRepository: INotificationWriteRepository) {}

  async execute(
    notificationId: string,
  ): Promise<NotificationResponseDto | null> {
    const notification =
      await this.notificationRepository.markAsRead(notificationId);
    return notification ? NotificationMapper.toResponse(notification) : null;
  }
}
