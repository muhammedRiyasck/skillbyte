import { QuizConfigResponseDto } from '../dtos/QuizConfigResponseDto';

export interface IGetQuizConfigUseCase {
  execute(
    courseId: string,
    userId: string,
    role: string,
  ): Promise<QuizConfigResponseDto | null>;
}
