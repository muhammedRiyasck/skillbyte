import { IQuizConfig } from '../../domain/entities/QuizConfig';
import { QuizConfigResponseDto } from '../dtos/QuizConfigResponseDto';

/** Handles quiz config mapper functionality. */
export class QuizConfigMapper {
  /**
   * To dto for the QuizConfigMapper entity.
   *
   * @param entity - The entity information.
   * @returns The standardized HTTP response.
   */
  static toDto(entity: IQuizConfig): QuizConfigResponseDto {
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
