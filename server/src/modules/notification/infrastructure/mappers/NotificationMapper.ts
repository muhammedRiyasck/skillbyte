import { Types } from 'mongoose';
import { INotification as INotificationEntity } from '../../domain/entities/Notification';
import { INotificationDocument } from '../models/NotificationModel';

export class NotificationMapper {
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
