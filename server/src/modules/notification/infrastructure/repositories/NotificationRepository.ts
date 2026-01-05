import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { INotification } from '../../domain/entities/Notification';
import { INotificationRepository } from '../../domain/IRepositories/INotificationRepository';
import {
  INotificationDocument,
  NotificationModel,
} from '../models/NotificationModel';

export class NotificationRepository
  extends BaseRepository<INotification, INotificationDocument>
  implements INotificationRepository
{
  constructor() {
    super(NotificationModel);
  }

  public toEntity(doc: INotificationDocument): INotification {
    return {
      userId: doc.userId,
      title: doc.title,
      message: doc.message,
      type: doc.type,
      isRead: doc.isRead,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      notificationId: doc._id as string,
    };
  }

  async paginatedList(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    sort?: Record<string, 1 | -1>,
  ): Promise<{ data: INotification[]; total: number }> {
    return super.paginatedList(filter, page, limit, sort);
  }

  async findByUserId(
    userId: string,
    limit: number = 20,
  ): Promise<INotification[]> {
    const notifications = await this.model
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    return notifications.map((doc) => this.toEntity(doc));
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    const updated = await this.model.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true },
    );
    return updated ? this.toEntity(updated) : null;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.model.updateMany({ userId, isRead: false }, { isRead: true });
  }

  async save(notification: INotification): Promise<INotification> {
    const created = await this.model.create(notification);
    return this.toEntity(created);
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }
}
