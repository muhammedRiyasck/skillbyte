import { GetUserNotificationsUseCase } from '../application/use-cases/GetUserNotificationsUseCase';
import { GetRecentNotificationsUseCase } from '../application/use-cases/GetRecentNotificationsUseCase';
import { MarkNotificationAsReadUseCase } from '../application/use-cases/MarkNotificationAsReadUseCase';
import { MarkAllNotificationsAsReadUseCase } from '../application/use-cases/MarkAllNotificationsAsReadUseCase';
import { CreateNotificationUseCase } from '../application/use-cases/CreateNotificationUseCase';
import { NotificationRepository } from '../infrastructure/repositories/NotificationRepository';
import { NotificationController } from './NotificationController';
import { EnrollmentReadRepository } from '../../enrollment/infrastructure/repositories/EnrollmentReadRepository';

import { MentorshipNotificationListener } from '../infrastructure/events/listeners/MentorshipNotificationListener';
import { PaymentNotificationListener } from '../infrastructure/events/listeners/PaymentNotificationListener';
import { CourseNotificationListener } from '../infrastructure/events/listeners/CourseNotificationListener';
import { WithdrawalNotificationListener } from '../infrastructure/events/listeners/WithdrawalNotificationListener';

const notificationRepo = new NotificationRepository();
const enrollmentReadRepo = new EnrollmentReadRepository();

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

// Domain-specific notification listeners (SRP compliant)
new MentorshipNotificationListener(createNotificationUC);
new PaymentNotificationListener(createNotificationUC);
new CourseNotificationListener(createNotificationUC, enrollmentReadRepo);
new WithdrawalNotificationListener(createNotificationUC);

export const notificationContainer = new NotificationController(
  getUserNotificationsUC,
  getRecentNotificationsUC,
  markNotificationAsReadUC,
  markAllNotificationsAsReadUC,
  createNotificationUC,
);
