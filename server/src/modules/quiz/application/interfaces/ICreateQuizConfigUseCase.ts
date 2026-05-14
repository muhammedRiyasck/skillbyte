import { IQuizConfig } from '../../domain/entities/QuizConfig';

export interface ICreateQuizConfigUseCase {
  execute(
    data: Omit<
      IQuizConfig,
      'configId' | 'cachedQuestions' | 'questionsGeneratedAt'
    >,
  ): Promise<IQuizConfig>;
}
