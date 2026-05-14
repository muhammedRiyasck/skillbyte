import { IQuizConfig } from '../../domain/entities/QuizConfig';

export interface IGetQuizConfigUseCase {
  execute(
    courseId: string,
    userId: string,
    role: string,
  ): Promise<IQuizConfig | null>;
}
