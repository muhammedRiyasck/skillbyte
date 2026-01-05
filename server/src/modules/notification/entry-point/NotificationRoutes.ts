import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/AuthMiddleware';
import { notificationContainer } from './NotificationContainer';
import asyncHandler from '../../../shared/utils/AsyncHandler';

const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get(
  '/',
  asyncHandler(notificationContainer.getUserNotifications),
);
notificationRouter.patch(
  '/:id/read',
  asyncHandler(notificationContainer.markAsRead),
);
notificationRouter.patch(
  '/read-all',
  asyncHandler(notificationContainer.markAllAsRead),
);
notificationRouter.post(
  '/test',
  asyncHandler(notificationContainer.sendTestNotification),
);

export { notificationRouter };
