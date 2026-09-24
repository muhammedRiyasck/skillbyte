import { INotificationReadRepository } from '../../domain/IRepositories/INotificationRepository';
import { NotificationMapper } from '../mappers/NotificationMapper';
import { NotificationResponseDto } from '../dtos/NotificationDto';
import { IGetUserNotificationsUseCase } from '../interfaces/IGetUserNotificationsUseCase';

/** Executes the business logic for get user notifications. */
export class GetUserNotificationsUseCase
  implements IGetUserNotificationsUseCase
{
  constructor(private notificationRepository: INotificationReadRepository) {}

  /**
   * Execute for the GetUserNotifications entity.
   *
   * @param userId - The unique identifier for the user.
   * @param page - The page information.
   * @param limit - The limit information.
   * @returns The standardized HTTP response.
   */
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
