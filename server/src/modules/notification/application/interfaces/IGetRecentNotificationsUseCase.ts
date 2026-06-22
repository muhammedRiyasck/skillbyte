import { NotificationResponseDto } from '../dtos/NotificationDto';

export interface IGetRecentNotificationsUseCase {
  execute(userId: string, limit?: number): Promise<NotificationResponseDto[]>;
}
