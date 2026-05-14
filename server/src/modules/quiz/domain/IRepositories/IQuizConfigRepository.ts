import { IQuizConfig } from '../entities/QuizConfig';

export interface IQuizConfigRepository {
  create(config: IQuizConfig): Promise<IQuizConfig>;
  update(
    courseId: string,
    updates: Partial<IQuizConfig>,
  ): Promise<IQuizConfig | null>;
  findByCourseId(courseId: string): Promise<IQuizConfig | null>;
  findActiveByCourseId(courseId: string): Promise<IQuizConfig | null>;
}
