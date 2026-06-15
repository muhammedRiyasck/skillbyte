import { QuizConfigResponseDto } from '../dtos/QuizConfigResponseDto';
import { UpdateQuizConfigRequestDto } from '../dtos/QuizRequestDto';

export interface IUpdateQuizConfigUseCase {
  execute(
    courseId: string,
    instructorId: string,
    updates: UpdateQuizConfigRequestDto,
  ): Promise<QuizConfigResponseDto | null>;
}
