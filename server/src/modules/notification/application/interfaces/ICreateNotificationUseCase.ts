import { NotificationResponseDto } from '../dtos/NotificationDto';
import { NotificationType } from '../../../../shared/enums/NotificationType';

export interface ICreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
}

export interface ICreateNotificationUseCase {
  execute(data: ICreateNotificationData): Promise<NotificationResponseDto>;
}
