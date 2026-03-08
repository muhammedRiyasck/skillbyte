import { Types } from 'mongoose';
import { INotification as INotificationEntity } from '../../domain/entities/Notification';
import { INotificationDocument } from '../../infrastructure/models/NotificationModel';

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

  static toEntity(doc: INotificationDocument): INotificationEntity {
    return {
      userId: doc.userId.toString(),
      title: doc.title,
      message: doc.message,
      type: doc.type,
      isRead: doc.isRead,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      notificationId: (doc._id as Types.ObjectId).toString(),
    };
  }
}
