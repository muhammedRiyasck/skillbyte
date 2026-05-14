import { ICreateQuizConfigUseCase } from '../interfaces/ICreateQuizConfigUseCase';
import { IQuizConfig } from '../../domain/entities/QuizConfig';
import { IQuizConfigRepository } from '../../domain/IRepositories/IQuizConfigRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class CreateQuizConfigUseCase implements ICreateQuizConfigUseCase {
  constructor(private quizConfigRepository: IQuizConfigRepository) {}

  async execute(
    data: Omit<
      IQuizConfig,
      'configId' | 'cachedQuestions' | 'questionsGeneratedAt'
    >,
  ): Promise<IQuizConfig> {
    const existingConfig = await this.quizConfigRepository.findByCourseId(
      data.courseId,
    );
    if (existingConfig) {
      throw new HttpError(
        'Quiz config already exists for this course',
        HttpStatusCode.CONFLICT,
      );
    }

    const configToCreate: IQuizConfig = {
      ...data,
      cachedQuestions: null,
      questionsGeneratedAt: null,
    };

    return await this.quizConfigRepository.create(configToCreate);
  }
}
