import { QuizConfigResponseDto } from '../dtos/QuizConfigResponseDto';
import { CreateQuizConfigRequestDto } from '../dtos/QuizRequestDto';

export interface ICreateQuizConfigUseCase {
  execute(
    data: CreateQuizConfigRequestDto & { instructorId: string },
  ): Promise<QuizConfigResponseDto>;
}
