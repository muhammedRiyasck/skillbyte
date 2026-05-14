import { IQuizConfig } from '../../domain/entities/QuizConfig';
import { IQuizConfigDto } from '../dtos/QuizConfigDto';

export class QuizConfigMapper {
  static toDto(entity: IQuizConfig): IQuizConfigDto {
    return {
      configId: entity.configId,
      courseId: entity.courseId,
      isEnabled: entity.isEnabled,
      topics: entity.topics,
      questionCount: entity.questionCount,
      questionTypes: entity.questionTypes,
      difficulty: entity.difficulty,
      passPercentage: entity.passPercentage,
      maxAttempts: entity.maxAttempts,
      timeLimit: entity.timeLimit,
      cachedPoolSize: entity.cachedQuestions
        ? entity.cachedQuestions.length
        : 0,
      questionsGeneratedAt: entity.questionsGeneratedAt,
      isPoolGenerationPending: entity.isPoolGenerationPending || false,
    };
  }
}
