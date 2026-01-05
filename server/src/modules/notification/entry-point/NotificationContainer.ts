import { GetUserNotificationsUseCase } from '../application/use-cases/GetUserNotificationsUseCase';
import { GetRecentNotificationsUseCase } from '../application/use-cases/GetRecentNotificationsUseCase';
import { MarkNotificationAsReadUseCase } from '../application/use-cases/MarkNotificationAsReadUseCase';
import { MarkAllNotificationsAsReadUseCase } from '../application/use-cases/MarkAllNotificationsAsReadUseCase';
import { CreateNotificationUseCase } from '../application/use-cases/CreateNotificationUseCase';
import { NotificationRepository } from '../infrastructure/repositories/NotificationRepository';
import { NotificationController } from './NotificationController';

const notificationRepo = new NotificationRepository();

const getUserNotificationsUC = new GetUserNotificationsUseCase(
  notificationRepo,
);
const getRecentNotificationsUC = new GetRecentNotificationsUseCase(
  notificationRepo,
);
const markNotificationAsReadUC = new MarkNotificationAsReadUseCase(
  notificationRepo,
);
const markAllNotificationsAsReadUC = new MarkAllNotificationsAsReadUseCase(
  notificationRepo,
);
const createNotificationUC = new CreateNotificationUseCase(notificationRepo);

export const notificationContainer = new NotificationController(
  getUserNotificationsUC,
  getRecentNotificationsUC,
  markNotificationAsReadUC,
  markAllNotificationsAsReadUC,
  createNotificationUC,
);
