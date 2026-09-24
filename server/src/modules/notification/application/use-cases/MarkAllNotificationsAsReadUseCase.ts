import { INotificationWriteRepository } from '../../domain/IRepositories/INotificationRepository';
import { IMarkAllNotificationsAsReadUseCase } from '../interfaces/IMarkAllNotificationsAsReadUseCase';

/** Executes the business logic for mark all notifications as read. */
export class MarkAllNotificationsAsReadUseCase
  implements IMarkAllNotificationsAsReadUseCase
{
  constructor(private notificationRepository: INotificationWriteRepository) {}

  /**
   * Execute for the MarkAllNotificationsAsRead entity.
   *
   * @param userId - The unique identifier for the user.
   */
  async execute(userId: string): Promise<void> {
    return this.notificationRepository.markAllAsRead(userId);
  }
}
