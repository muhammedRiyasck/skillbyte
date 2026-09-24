import { INotificationWriteRepository } from '../../domain/IRepositories/INotificationRepository';
import { NotificationMapper } from '../mappers/NotificationMapper';
import { NotificationResponseDto } from '../dtos/NotificationDto';
import { SocketService } from '../../../../shared/services/socket/SocketService';
import {
  ICreateNotificationUseCase,
  ICreateNotificationData,
} from '../interfaces/ICreateNotificationUseCase';
import { NotificationType } from '../../../../shared/enums/NotificationType';

/** Executes the business logic for create notification. */
export class CreateNotificationUseCase implements ICreateNotificationUseCase {
  constructor(private notificationRepository: INotificationWriteRepository) {}

  /**
   * Execute for the CreateNotification entity.
   *
   * @param data - The data information.
   * @returns The standardized HTTP response.
   */
  async execute(
    data: ICreateNotificationData,
  ): Promise<NotificationResponseDto> {
    const { userId, title, message, type = NotificationType.INFO } = data;
    const notification = {
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const savedNotification =
      await this.notificationRepository.save(notification);

    // Emit real-time notification
    SocketService.getInstance().emitToUser(userId, 'notification', {
      ...savedNotification,
      id: savedNotification.notificationId,
    });

    return NotificationMapper.toResponse(savedNotification);
  }
}
