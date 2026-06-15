import { IQuizAttempt } from '../../domain/entities/QuizAttempt';
import { QuizAttemptResponseDto } from '../dtos/QuizAttemptResponseDto';

export class QuizAttemptMapper {
  static toDto(entity: IQuizAttempt): QuizAttemptResponseDto {
    return {
      attemptId: entity.attemptId!,
      configId: entity.configId,
      courseId: entity.courseId,
      userId: entity.userId,
      attemptNumber: entity.attemptNumber,
      status: entity.status,
      questions: entity.questions,
      answers: entity.answers,
      perQuestionResult: entity.perQuestionResult,
      score: entity.score,
      passed: entity.passed,
      aiFeedback: entity.aiFeedback,
      startedAt: entity.startedAt,
      submittedAt: entity.submittedAt,
    };
  }
}
