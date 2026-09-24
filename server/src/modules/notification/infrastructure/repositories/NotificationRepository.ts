import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { INotification } from '../../domain/entities/Notification';
import { INotificationRepository } from '../../domain/IRepositories/INotificationRepository';
import {
  INotificationDocument,
  NotificationModel,
} from '../models/NotificationModel';
import { NotificationMapper } from '../mappers/NotificationMapper';

/** Manages database operations for notification. */
export class NotificationRepository
  extends BaseRepository<INotification, INotificationDocument>
  implements INotificationRepository
{
  constructor() {
    super(NotificationModel);
  }

  /**
   * To entity for the Notification entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  public toEntity(doc: INotificationDocument): INotification {
    return NotificationMapper.toEntity(doc);
  }

  /**
   * Paginated list for the Notification entity.
   *
   * @param filter - The filter information.
   * @param page - The page information.
   * @param limit - The limit information.
   * @param sort - The sort information.
   * @returns The result of the operation.
   */
  async paginatedList(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    sort?: Record<string, 1 | -1>,
  ): Promise<{ data: INotification[]; total: number }> {
    return super.paginatedList(filter, page, limit, sort);
  }

  /**
   * Find by user id for the Notification entity.
   *
   * @param userId - The unique identifier for the user.
   * @param limit - The limit information.
   * @returns The result of the operation.
   */
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

  /**
   * Mark as read for the Notification entity.
   *
   * @param notificationId - The unique identifier for the notification.
   * @returns The result of the operation.
   */
  async markAsRead(notificationId: string): Promise<INotification | null> {
    const updated = await this.model.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true },
    );
    return updated ? this.toEntity(updated) : null;
  }

  /**
   * Mark all as read for the Notification entity.
   *
   * @param userId - The unique identifier for the user.
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.model.updateMany({ userId, isRead: false }, { isRead: true });
  }

  /**
   * Save for the Notification entity.
   *
   * @param notification - The notification information.
   * @returns The result of the operation.
   */
  async save(notification: INotification): Promise<INotification> {
    const created = await this.model.create(notification);
    return this.toEntity(created);
  }

  /**
   * Delete for the Notification entity.
   *
   * @param id - The unique identifier for the id.
   */
  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }
}
