import { INotification as INotificationEntity } from '../../domain/entities/Notification';
import { NotificationResponseDto } from '../dtos/NotificationDto';

export class NotificationMapper {
  static toResponse(
    notification: INotificationEntity,
  ): NotificationResponseDto {
    return {
      id: notification.notificationId!,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type as 'info' | 'success' | 'warning' | 'error',
      isRead: notification.isRead,
      createdAt: notification.createdAt!,
      updatedAt: notification.updatedAt!,
    };
  }

  static toResponseList(
    notifications: INotificationEntity[],
  ): NotificationResponseDto[] {
    return notifications.map((n) => this.toResponse(n));
  }
}
