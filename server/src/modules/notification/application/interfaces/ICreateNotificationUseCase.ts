import { INotification } from '../../domain/entities/Notification';
import { NotificationType } from '../../../../shared/enums/NotificationType';

export interface ICreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
}

export interface ICreateNotificationUseCase {
  execute(data: ICreateNotificationData): Promise<INotification>;
}
