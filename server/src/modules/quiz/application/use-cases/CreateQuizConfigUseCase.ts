import { ICreateQuizConfigUseCase } from '../interfaces/ICreateQuizConfigUseCase';
import { IQuizConfig } from '../../domain/entities/QuizConfig';
import { QuizConfigResponseDto } from '../dtos/QuizConfigResponseDto';
import { QuizConfigMapper } from '../mappers/QuizConfigMapper';
import { CreateQuizConfigRequestDto } from '../dtos/QuizRequestDto';
import { IQuizConfigRepository } from '../../domain/IRepositories/IQuizConfigRepository';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { IAIQuizService } from '../../../../shared/services/ai/IAIQuizService';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import logger from '../../../../shared/utils/Logger';

export class CreateQuizConfigUseCase implements ICreateQuizConfigUseCase {
  constructor(
    private quizConfigRepository: IQuizConfigRepository,
    private aiQuizService: IAIQuizService,
    private courseRepository: ICourseRepository,
  ) {}

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

    const isEnabled = data.isEnabled ?? true;

    // AI Quota Protection Limits (defense in depth, similar to update)
    if (data.questionCount !== undefined && data.questionCount > 15) {
      throw new HttpError(
        'Question count cannot exceed 15 to conserve AI resources.',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (data.maxAttempts !== undefined && data.maxAttempts > 2) {
      throw new HttpError(
        'Maximum attempts cannot exceed 2 to prevent API abuse.',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const configToCreate: IQuizConfig = {
      ...data,
      isEnabled,
      cachedQuestions: null,
      questionsGeneratedAt: null,
      isPoolGenerationPending: isEnabled, // If enabled, we will start generation
    };

    const createdConfig =
      await this.quizConfigRepository.create(configToCreate);

    if (isEnabled && createdConfig) {
      // Background task to pre-generate questions
      (async () => {
        try {
          const courseId = data.courseId;
          const course = await this.courseRepository.findById(courseId);
          const courseTitle = course?.title || `Course ${courseId}`;
          const totalQuestionsNeeded =
            createdConfig.questionCount * createdConfig.maxAttempts;

          logger.info(
            `[QuizConfig] Starting background pre-generation for new config "${courseTitle}" (Pool Size: ${totalQuestionsNeeded})`,
          );

          const questions = await this.aiQuizService.generateQuestions({
            courseTitle,
            topics: createdConfig.topics,
            questionCount: totalQuestionsNeeded,
            difficulty: createdConfig.difficulty,
            questionTypes: createdConfig.questionTypes,
          });

          await this.quizConfigRepository.update(courseId, {
            cachedQuestions: questions,
            questionsGeneratedAt: new Date(),
            isPoolGenerationPending: false,
          });

          logger.info(
            `[QuizConfig] Background pre-generation complete for new config "${courseTitle}". Got ${questions.length} questions.`,
          );
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
          logger.error(
            `[QuizConfig] Background pre-generation failed for course ${data.courseId}:`,
            { message: errorMessage },
          );
          // Reset pending status so student can try on-demand fallback
          await this.quizConfigRepository.update(data.courseId, {
            isPoolGenerationPending: false,
          });
        }
      })();
    }

    return QuizConfigMapper.toDto(createdConfig);
  }
}
