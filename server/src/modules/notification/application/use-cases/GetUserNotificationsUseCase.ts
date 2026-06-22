import { INotificationReadRepository } from '../../domain/IRepositories/INotificationRepository';
import { NotificationMapper } from '../mappers/NotificationMapper';
import { NotificationResponseDto } from '../dtos/NotificationDto';
import { IGetUserNotificationsUseCase } from '../interfaces/IGetUserNotificationsUseCase';

export class GetUserNotificationsUseCase
  implements IGetUserNotificationsUseCase
{
  constructor(private notificationRepository: INotificationReadRepository) {}

  async execute(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ notifications: NotificationResponseDto[]; total: number }> {
    const result = await this.notificationRepository.paginatedList(
      { userId },
      page,
      limit,
    );
    return {
      notifications: NotificationMapper.toResponseList(result.data),
      total: result.total,
    };
  }
}
