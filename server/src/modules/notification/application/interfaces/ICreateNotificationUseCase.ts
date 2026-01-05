import { INotification } from '../../domain/entities/Notification';

export interface ICreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface ICreateNotificationUseCase {
  execute(data: ICreateNotificationData): Promise<INotification>;
}
