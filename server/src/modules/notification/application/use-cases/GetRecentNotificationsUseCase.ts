import { INotificationReadRepository } from '../../domain/IRepositories/INotificationRepository';
import { NotificationMapper } from '../mappers/NotificationMapper';
import { NotificationResponseDto } from '../dtos/NotificationDto';
import { IGetRecentNotificationsUseCase } from '../interfaces/IGetRecentNotificationsUseCase';

/** Executes the business logic for get recent notifications. */
export class GetRecentNotificationsUseCase
  implements IGetRecentNotificationsUseCase
{
  constructor(private notificationRepository: INotificationReadRepository) {}

  /**
   * Execute for the GetRecentNotifications entity.
   *
   * @param userId - The unique identifier for the user.
   * @param limit - The limit information.
   * @returns The standardized HTTP response.
   */
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
