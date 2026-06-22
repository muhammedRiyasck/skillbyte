import { NotificationResponseDto } from '../dtos/NotificationDto';

export interface IGetUserNotificationsUseCase {
  execute(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<{ notifications: NotificationResponseDto[]; total: number }>;
}
