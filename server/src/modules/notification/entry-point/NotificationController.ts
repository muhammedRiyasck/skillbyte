import { Request, Response } from 'express';
import { IGetUserNotificationsUseCase } from '../application/interfaces/IGetUserNotificationsUseCase';
import { IGetRecentNotificationsUseCase } from '../application/interfaces/IGetRecentNotificationsUseCase';
import { IMarkNotificationAsReadUseCase } from '../application/interfaces/IMarkNotificationAsReadUseCase';
import { IMarkAllNotificationsAsReadUseCase } from '../application/interfaces/IMarkAllNotificationsAsReadUseCase';
import { ICreateNotificationUseCase } from '../application/interfaces/ICreateNotificationUseCase';
import { NotificationPaginationSchema } from '../application/dtos/NotificationDto';
import { NotificationMapper } from '../application/mappers/NotificationMapper';
import { AuthenticatedRequest } from '../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../shared/utils/ApiResponseHelper';

export class NotificationController {
  constructor(
    private _getUserNotificationsUseCase: IGetUserNotificationsUseCase,
    private _getRecentNotificationsUseCase: IGetRecentNotificationsUseCase,
    private _markNotificationAsReadUseCase: IMarkNotificationAsReadUseCase,
    private _markAllNotificationsAsReadUseCase: IMarkAllNotificationsAsReadUseCase,
    private _createNotificationUseCase: ICreateNotificationUseCase,
  ) {}

  getUserNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.id;
      const validatedQuery = NotificationPaginationSchema.parse(req.query);
      const { page, limit } = validatedQuery;

      // If page is not specified but limit is, we want recent notifications for dropdown
      if (!req.query.page && req.query.limit) {
        const notifications = await this._getRecentNotificationsUseCase.execute(
          userId,
          limit,
        );
        ApiResponseHelper.success(
          res,
          'Recent notifications fetched successfully',
          NotificationMapper.toResponseList(notifications),
        );
        return;
      }

      const { notifications, total } =
        await this._getUserNotificationsUseCase.execute(userId, page, limit);

      ApiResponseHelper.success(res, 'Notifications fetched successfully', {
        notifications: NotificationMapper.toResponseList(notifications),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      ApiResponseHelper.error(
        res,
        'Failed to fetch notifications',
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const notification =
        await this._markNotificationAsReadUseCase.execute(id);
      if (!notification) {
        ApiResponseHelper.notFound(res, 'Notification not found');
        return;
      }
      ApiResponseHelper.success(
        res,
        'Notification marked as read',
        NotificationMapper.toResponse(notification),
      );
    } catch (error) {
      ApiResponseHelper.error(
        res,
        'Failed to mark notification as read',
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  sendTestNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.id;
      const notification = await this._createNotificationUseCase.execute({
        userId,
        title: 'Test Notification',
        message: 'This is a test notification to verify the real-time system.',
        type: 'error',
      });
      ApiResponseHelper.success(
        res,
        'Test notification sent',
        NotificationMapper.toResponse(notification),
      );
    } catch (error) {
      ApiResponseHelper.error(
        res,
        'Failed to send test notification',
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.id;
      await this._markAllNotificationsAsReadUseCase.execute(userId);
      ApiResponseHelper.success(res, 'All notifications marked as read');
    } catch (error) {
      ApiResponseHelper.error(
        res,
        'Failed to mark notifications as read',
        error instanceof Error ? error.message : undefined,
      );
    }
  };
}
