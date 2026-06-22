import { Request, Response } from 'express';
import { IGetUserNotificationsUseCase } from '../application/interfaces/IGetUserNotificationsUseCase';
import { IGetRecentNotificationsUseCase } from '../application/interfaces/IGetRecentNotificationsUseCase';
import { IMarkNotificationAsReadUseCase } from '../application/interfaces/IMarkNotificationAsReadUseCase';
import { IMarkAllNotificationsAsReadUseCase } from '../application/interfaces/IMarkAllNotificationsAsReadUseCase';
import { ICreateNotificationUseCase } from '../application/interfaces/ICreateNotificationUseCase';
import { NotificationPaginationSchema } from './validations/NotificationValidation';
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
        notifications,
      );
      return;
    }

    const { notifications, total } =
      await this._getUserNotificationsUseCase.execute(userId, page, limit);

    ApiResponseHelper.success(res, 'Notifications fetched successfully', {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  };

  markAsRead = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const notification = await this._markNotificationAsReadUseCase.execute(id);
    if (!notification) {
      ApiResponseHelper.notFound(res, 'Notification not found');
      return;
    }
    ApiResponseHelper.success(res, 'Notification marked as read', notification);
  };

  markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.user.id;
    await this._markAllNotificationsAsReadUseCase.execute(userId);
    ApiResponseHelper.success(res, 'All notifications marked as read');
  };
}
