import { INotificationWriteRepository } from '../../domain/IRepositories/INotificationRepository';
import { NotificationMapper } from '../mappers/NotificationMapper';
import { NotificationResponseDto } from '../dtos/NotificationDto';
import { IMarkNotificationAsReadUseCase } from '../interfaces/IMarkNotificationAsReadUseCase';

/** Executes the business logic for mark notification as read. */
export class MarkNotificationAsReadUseCase
  implements IMarkNotificationAsReadUseCase
{
  constructor(private notificationRepository: INotificationWriteRepository) {}

  /**
   * Execute for the MarkNotificationAsRead entity.
   *
   * @param notificationId - The unique identifier for the notification.
   * @returns The standardized HTTP response.
   */
  async execute(
    notificationId: string,
  ): Promise<NotificationResponseDto | null> {
    const notification =
      await this.notificationRepository.markAsRead(notificationId);
    return notification ? NotificationMapper.toResponse(notification) : null;
  }
}
