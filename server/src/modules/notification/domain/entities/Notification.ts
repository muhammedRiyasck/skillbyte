import { NotificationType } from '../../../../shared/enums/NotificationType';

export interface INotification {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  notificationId?: string;
}
