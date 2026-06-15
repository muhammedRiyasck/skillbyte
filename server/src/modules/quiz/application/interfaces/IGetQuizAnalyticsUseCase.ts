import { QuizAnalyticsResponseDto } from '../dtos/QuizAnalyticsResponseDto';

export interface IGetQuizAnalyticsUseCase {
  execute(
    courseId: string,
    instructorId: string,
    page?: number,
    limit?: number,
  ): Promise<QuizAnalyticsResponseDto>;
}
