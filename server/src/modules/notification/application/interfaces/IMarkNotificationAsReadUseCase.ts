import { INotification } from '../../domain/entities/Notification';

export interface IMarkNotificationAsReadUseCase {
  execute(notificationId: string): Promise<INotification | null>;
}
