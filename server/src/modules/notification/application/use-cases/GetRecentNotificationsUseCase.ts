import { INotificationReadRepository } from '../../domain/IRepositories/INotificationRepository';
import { NotificationMapper } from '../mappers/NotificationMapper';
import { NotificationResponseDto } from '../dtos/NotificationDto';
import { IGetRecentNotificationsUseCase } from '../interfaces/IGetRecentNotificationsUseCase';

export class GetRecentNotificationsUseCase
  implements IGetRecentNotificationsUseCase
{
  constructor(private notificationRepository: INotificationReadRepository) {}

  async execute(
    userId: string,
    limit: number = 5,
  ): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationRepository.findByUserId(
      userId,
      limit,
    );
    return NotificationMapper.toResponseList(notifications);
  }
}
