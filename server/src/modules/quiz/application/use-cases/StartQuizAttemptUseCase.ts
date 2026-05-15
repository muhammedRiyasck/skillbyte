import { IStartQuizAttemptUseCase } from '../interfaces/IStartQuizAttemptUseCase';
import { IQuizAttemptRepository } from '../../domain/IRepositories/IQuizAttemptRepository';
import { IQuizConfigRepository } from '../../domain/IRepositories/IQuizConfigRepository';
import { IAIQuizService } from '../../../../shared/services/ai/IAIQuizService';
import { IQuizAttempt } from '../../domain/entities/QuizAttempt';
import { QuizStatus } from '../../../../shared/enums/QuizStatus';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import logger from '../../../../shared/utils/Logger';

/** Fisher-Yates in-place shuffle — returns the same array shuffled. */
function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class StartQuizAttemptUseCase implements IStartQuizAttemptUseCase {
  constructor(
    private quizAttemptRepository: IQuizAttemptRepository,
    private quizConfigRepository: IQuizConfigRepository,
    private aiQuizService: IAIQuizService,
    private enrollmentReadRepo: IEnrollmentReadRepository,
    private courseRepo: ICourseRepository,
  ) {}

  async execute(courseId: string, userId: string): Promise<IQuizAttempt> {
    // 1. Check if enrollment exists and is 99% complete (videos watched)
    const enrollment = await this.enrollmentReadRepo.findEnrollment(
      userId,
      courseId,
    );
    if (!enrollment || enrollment.progress < 99) {
      throw new HttpError(
        'Course lessons must be completed to start the quiz',
        HttpStatusCode.FORBIDDEN,
      );
    }

    // 2. Fetch the active quiz config
    const config =
      await this.quizConfigRepository.findActiveByCourseId(courseId);
    if (!config) {
      throw new HttpError(
        'No active quiz configuration found for this course',
        HttpStatusCode.NOT_FOUND,
      );
    }

    // 3. Check for existing in-progress attempt to reuse
    const latestAttempt =
      await this.quizAttemptRepository.findLatestByCourseAndUser(
        courseId,
        userId,
      );

    if (latestAttempt && latestAttempt.status === QuizStatus.IN_PROGRESS) {
      // If the attempt is corrupted (missing questionId from older versions), don't reuse it
      const isCorrupted =
        latestAttempt.questions &&
        latestAttempt.questions.some((q) => !q.questionId);
      if (!isCorrupted) {
        // Reuse the existing in-progress attempt
        return latestAttempt;
      } else {
        // Delete the corrupted attempt so a fresh one can be generated
        await this.quizAttemptRepository.deleteAttemptsByCourseAndUser(
          courseId,
          userId,
        );
      }
    }

    // 4. Check attempt limits for new attempt
    const currentAttemptCount =
      await this.quizAttemptRepository.countAttemptsByUser(courseId, userId);
    if (currentAttemptCount >= config.maxAttempts) {
      throw new HttpError(
        `Maximum number of attempts (${config.maxAttempts}) reached`,
        HttpStatusCode.FORBIDDEN,
      );
    }

    // 4. Fetch or generate questions
    const attemptNumber = currentAttemptCount + 1;
    const startIndex = (attemptNumber - 1) * config.questionCount;
    const endIndex = startIndex + config.questionCount;

    let questionsToUse = config.cachedQuestions
      ? config.cachedQuestions.slice(startIndex, endIndex)
      : [];

    // Check if the slice we got is valid and has enough questions
    const hasEnoughQuestions = questionsToUse.length === config.questionCount;
    const hasCorruptedSlice = questionsToUse.some(
      (q: { questionId?: string } | undefined) => !q?.questionId,
    );

    if (!hasEnoughQuestions || hasCorruptedSlice) {
      // Fetch course title for better AI context
      const course = await this.courseRepo.findById(courseId);
      const courseTitle = course?.title || `Course ${courseId}`;

      // If cache is insufficient or corrupted, generate fresh questions for this specific attempt
      questionsToUse = await this.aiQuizService.generateQuestions({
        courseTitle,
        topics: config.topics,
        questionCount: config.questionCount,
        difficulty: config.difficulty,
        questionTypes: config.questionTypes,
      });

      if (questionsToUse.length < config.questionCount) {
        logger.warn(
          `[QuizAttempt] Generated only ${questionsToUse.length}/${config.questionCount} questions for course ${courseId}`,
        );
      }

      // "Top Up" the database cache so other students benefit from this on-demand call
      const currentCache = config.cachedQuestions || [];
      const updatedCache = [...currentCache];

      // Fill the specific slice for this attempt in the pool
      for (let i = 0; i < questionsToUse.length; i++) {
        updatedCache[startIndex + i] = questionsToUse[i];
      }

      await this.quizConfigRepository.update(courseId, {
        cachedQuestions: updatedCache,
        questionsGeneratedAt: new Date(),
      });
    }

    // Shuffle the questions so the order is different every attempt.
    // Even if the same slice is served (e.g. retry scenario), the student
    // sees a randomized order — preventing memorization by position.
    questionsToUse = shuffleArray([...questionsToUse]);

    // 5. Create new attempt
    const newAttempt: IQuizAttempt = {
      configId: config.configId!,
      courseId,
      userId,
      attemptNumber,
      status: QuizStatus.IN_PROGRESS,
      questions: questionsToUse,
      answers: [],
      perQuestionResult: [],
      score: 0,
      passed: false,
      aiFeedback: '',
      startedAt: new Date(),
    };

    return await this.quizAttemptRepository.create(newAttempt);
  }
}
