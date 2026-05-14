import { IUpdateQuizConfigUseCase } from '../interfaces/IUpdateQuizConfigUseCase';
import { IQuizConfig } from '../../domain/entities/QuizConfig';
import { IQuizConfigRepository } from '../../domain/IRepositories/IQuizConfigRepository';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { IAIQuizService } from '../../../../shared/services/ai/IAIQuizService';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import logger from '../../../../shared/utils/Logger';

export class UpdateQuizConfigUseCase implements IUpdateQuizConfigUseCase {
  constructor(
    private quizConfigRepository: IQuizConfigRepository,
    private aiQuizService: IAIQuizService,
    private courseRepository: ICourseRepository,
  ) {}

  async execute(
    courseId: string,
    instructorId: string,
    updates: Partial<IQuizConfig>,
  ): Promise<IQuizConfig | null> {
    const existingConfig =
      await this.quizConfigRepository.findByCourseId(courseId);

    if (!existingConfig) {
      throw new HttpError(
        'Quiz configuration not found',
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (existingConfig.instructorId.toString() !== instructorId.toString()) {
      throw new HttpError(
        'Unauthorized to update this quiz configuration',
        HttpStatusCode.FORBIDDEN,
      );
    }

    // AI Quota Protection Limits
    if (updates.questionCount !== undefined && updates.questionCount > 15) {
      throw new HttpError(
        'Question count cannot exceed 15 to conserve AI resources.',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (updates.maxAttempts !== undefined && updates.maxAttempts > 2) {
      throw new HttpError(
        'Maximum attempts cannot exceed 2 to prevent API abuse.',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (updates.topics !== undefined) {
      if (updates.topics.length > 3) {
        throw new HttpError(
          'Maximum of 3 topics allowed.',
          HttpStatusCode.BAD_REQUEST,
        );
      }

      // Defense-in-depth: block obvious prompt injection keywords at the input layer
      const INJECTION_PATTERN =
        /\b(ignore|forget|disregard|override|bypass|system|prompt|instruction|jailbreak|act as|pretend|roleplay)\b/i;

      for (const topic of updates.topics) {
        if (topic.trim().length === 0) {
          throw new HttpError(
            'Topics cannot be empty strings.',
            HttpStatusCode.BAD_REQUEST,
          );
        }
        if (topic.length > 50) {
          throw new HttpError(
            'Topic length cannot exceed 50 characters.',
            HttpStatusCode.BAD_REQUEST,
          );
        }
        if (INJECTION_PATTERN.test(topic)) {
          throw new HttpError(
            'Topic contains invalid content.',
            HttpStatusCode.BAD_REQUEST,
          );
        }
      }
    }

    // Determine if any core settings changed that would invalidate the cached questions
    const cacheInvalidatingKeys: (keyof IQuizConfig)[] = [
      'topics',
      'questionCount',
      'questionTypes',
      'difficulty',
    ];

    let shouldInvalidateCache = false;
    for (const key of cacheInvalidatingKeys) {
      if (
        updates[key] !== undefined &&
        JSON.stringify(updates[key]) !== JSON.stringify(existingConfig[key])
      ) {
        shouldInvalidateCache = true;
        break;
      }
    }

    const finalUpdates = { ...updates };
    if (shouldInvalidateCache) {
      finalUpdates.cachedQuestions = null;
      finalUpdates.questionsGeneratedAt = null;
    }

    const savedConfig = await this.quizConfigRepository.update(
      courseId,
      finalUpdates,
    );

    // Fire-and-forget background pre-generation so the first student never waits
    const mergedConfig = { ...existingConfig, ...finalUpdates };
    const totalQuestionsNeeded =
      mergedConfig.questionCount * mergedConfig.maxAttempts;
    const currentPoolSize = mergedConfig.cachedQuestions?.length || 0;

    const shouldPreGenerate =
      mergedConfig.isEnabled &&
      (currentPoolSize < totalQuestionsNeeded || shouldInvalidateCache);

    if (shouldPreGenerate && savedConfig) {
      // Set pending status immediately
      await this.quizConfigRepository.update(courseId, {
        isPoolGenerationPending: true,
      });

      // Background task
      (async () => {
        try {
          const course = await this.courseRepository.findById(courseId);
          const courseTitle = course?.title || `Course ${courseId}`;

          logger.info(
            `[QuizConfig] Starting background pre-generation for "${courseTitle}" (Pool Size: ${totalQuestionsNeeded})`,
          );

          const questions = await this.aiQuizService.generateQuestions({
            courseTitle,
            topics: mergedConfig.topics,
            questionCount: totalQuestionsNeeded,
            difficulty: mergedConfig.difficulty,
            questionTypes: mergedConfig.questionTypes,
          });

          await this.quizConfigRepository.update(courseId, {
            cachedQuestions: questions,
            questionsGeneratedAt: new Date(),
            isPoolGenerationPending: false,
          });

          logger.info(
            `[QuizConfig] Background pre-generation complete for "${courseTitle}". Got ${questions.length} questions.`,
          );
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
          logger.error(
            `[QuizConfig] Background pre-generation failed for course ${courseId}:`,
            { message: errorMessage },
          );
          // Reset pending status so student can try on-demand fallback
          await this.quizConfigRepository.update(courseId, {
            isPoolGenerationPending: false,
          });
        }
      })();
    }

    return savedConfig;
  }
}
