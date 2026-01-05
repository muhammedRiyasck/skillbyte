import { INotification } from '../entities/Notification';

export interface INotificationReadRepository {
  findByUserId(userId: string, limit?: number): Promise<INotification[]>;
  paginatedList(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    sort?: Record<string, 1 | -1>,
  ): Promise<{ data: INotification[]; total: number }>;
}

export interface INotificationWriteRepository {
  save(notification: INotification): Promise<INotification>;
  markAsRead(notificationId: string): Promise<INotification | null>;
  markAllAsRead(userId: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface INotificationRepository
  extends INotificationReadRepository,
    INotificationWriteRepository {}
