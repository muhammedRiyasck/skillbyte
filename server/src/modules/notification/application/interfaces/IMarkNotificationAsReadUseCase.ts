import { NotificationResponseDto } from '../dtos/NotificationDto';

export interface IMarkNotificationAsReadUseCase {
  execute(notificationId: string): Promise<NotificationResponseDto | null>;
}
