import { INotificationWriteRepository } from '../../domain/IRepositories/INotificationRepository';
import { INotification } from '../../domain/entities/Notification';
import { SocketService } from '../../../../shared/services/socket-service.ts/SocketService';
import {
  ICreateNotificationUseCase,
  ICreateNotificationData,
} from '../interfaces/ICreateNotificationUseCase';

export class CreateNotificationUseCase implements ICreateNotificationUseCase {
  constructor(private notificationRepository: INotificationWriteRepository) {}

  async execute(data: ICreateNotificationData): Promise<INotification> {
    const { userId, title, message, type = 'info' } = data;
    const notification: INotification = {
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const savedNotification =
      await this.notificationRepository.save(notification);

    // Emit real-time notification
    SocketService.getInstance().emitToUser(userId, 'notification', {
      ...savedNotification,
      id: savedNotification.notificationId,
    });

    return savedNotification;
  }
}
