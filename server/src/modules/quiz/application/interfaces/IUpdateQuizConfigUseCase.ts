import { IQuizConfig } from '../../domain/entities/QuizConfig';

export interface IUpdateQuizConfigUseCase {
  execute(
    courseId: string,
    instructorId: string,
    updates: Partial<IQuizConfig>,
  ): Promise<IQuizConfig | null>;
}
