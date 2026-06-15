import { ICreateQuizConfigUseCase } from '../interfaces/ICreateQuizConfigUseCase';
import { IQuizConfig } from '../../domain/entities/QuizConfig';
import { QuizConfigResponseDto } from '../dtos/QuizConfigResponseDto';
import { QuizConfigMapper } from '../mappers/QuizConfigMapper';
import { CreateQuizConfigRequestDto } from '../dtos/QuizRequestDto';
import { IQuizConfigRepository } from '../../domain/IRepositories/IQuizConfigRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class CreateQuizConfigUseCase implements ICreateQuizConfigUseCase {
  constructor(private quizConfigRepository: IQuizConfigRepository) {}

  async execute(
    data: CreateQuizConfigRequestDto & { instructorId: string },
  ): Promise<QuizConfigResponseDto> {
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
      isEnabled: data.isEnabled ?? true,
      cachedQuestions: null,
      questionsGeneratedAt: null,
      isPoolGenerationPending: false,
    };

    const createdConfig =
      await this.quizConfigRepository.create(configToCreate);
    return QuizConfigMapper.toDto(createdConfig);
  }
}
