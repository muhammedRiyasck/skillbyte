import { INotification as INotificationEntity } from '../../domain/entities/Notification';

export class NotificationMapper {
  static toResponse(notification: INotificationEntity) {
    return {
      id: notification.notificationId,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }

  static toResponseList(notifications: INotificationEntity[]) {
    return notifications.map((n) => this.toResponse(n));
  }
}
