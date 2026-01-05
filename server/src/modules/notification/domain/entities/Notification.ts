export interface INotification {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  notificationId?: string;
}
