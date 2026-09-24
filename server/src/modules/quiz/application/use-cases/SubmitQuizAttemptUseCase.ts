import { ISubmitQuizAttemptUseCase } from '../interfaces/ISubmitQuizAttemptUseCase';
import { IQuizAttemptRepository } from '../../domain/IRepositories/IQuizAttemptRepository';
import { IQuizConfigRepository } from '../../domain/IRepositories/IQuizConfigRepository';
import { IPerQuestionResult } from '../../domain/entities/QuizAttempt';
import { StudentAnswer } from '../../domain/entities/StudentAnswer';
import { QuizStatus } from '../../../../shared/enums/QuizStatus';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { QuizAttemptResponseDto } from '../dtos/QuizAttemptResponseDto';
import { QuizAttemptMapper } from '../mappers/QuizAttemptMapper';

import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import { IEnrollmentWriteRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentWriteRepository';
import { EnrollmentStatus } from '../../../../shared/enums/EnrollmentStatus';
import { IAIQuizService } from '../../../../shared/services/ai/IAIQuizService';
import { QuizGrader } from '../../domain/utils/QuizGrader';
import { IStudentRepository } from '../../../student/domain/IRepositories/IStudentRepository';

const XP_PER_CORRECT_ANSWER = 10;
const XP_BONUS_PASS = 50;

/** Executes the business logic for submit quiz attempt. */
export class SubmitQuizAttemptUseCase implements ISubmitQuizAttemptUseCase {
  constructor(
    private quizAttemptRepository: IQuizAttemptRepository,
    private quizConfigRepository: IQuizConfigRepository,
    private enrollmentReadRepo: IEnrollmentReadRepository,
    private enrollmentWriteRepo: IEnrollmentWriteRepository,
    private aiQuizService: IAIQuizService,
    private studentRepository: IStudentRepository,
  ) {}

  /**
   * Execute for the SubmitQuizAttempt entity.
   *
   * @param attemptId - The unique identifier for the attempt.
   * @param userId - The unique identifier for the user.
   * @param answers - The answers information.
   * @returns The standardized HTTP response.
   */
  async execute(
    attemptId: string,
    userId: string,
    answers: StudentAnswer[],
  ): Promise<QuizAttemptResponseDto> {
    const attempt = await this.quizAttemptRepository.findById(attemptId);
    if (!attempt) {
      throw new HttpError('Quiz attempt not found', HttpStatusCode.NOT_FOUND);
    }

    if (attempt.userId !== userId) {
      throw new HttpError(
        'Unauthorized to submit this attempt',
        HttpStatusCode.FORBIDDEN,
      );
    }

    if (attempt.status !== QuizStatus.IN_PROGRESS) {
      throw new HttpError(
        'Quiz attempt is already completed or timed out',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const config = await this.quizConfigRepository.findByCourseId(
      attempt.courseId,
    );
    if (!config) {
      throw new HttpError(
        'Quiz configuration not found',
        HttpStatusCode.NOT_FOUND,
      );
    }

    // Time-limit enforcement: grade the answers but mark as TIMED_OUT
    // A 1-minute grace period handles network latency from the client auto-submit.
    let timedOut = false;
    if (config.timeLimit !== null) {
      const elapsedMinutes =
        (Date.now() - new Date(attempt.startedAt).getTime()) / 60_000;
      if (elapsedMinutes > config.timeLimit + 1) {
        timedOut = true;
      }
    }

    const perQuestionResult: IPerQuestionResult[] = [];
    let correctCount = 0;
    const strongAreas = new Set<string>();
    const weakAreas = new Set<string>();

    for (const question of attempt.questions) {
      const studentAnswer = answers.find(
        (a) => a.questionId === question.questionId,
      );

      let isCorrect = false;
      if (studentAnswer) {
        isCorrect = QuizGrader.gradeAnswer(question, studentAnswer);
      }

      if (isCorrect) {
        correctCount++;
        strongAreas.add(question.topicTag);
      } else {
        weakAreas.add(question.topicTag);
      }

      perQuestionResult.push({
        questionId: question.questionId,
        isCorrect,
      });
    }

    const score = Math.round((correctCount / attempt.questions.length) * 100);
    const passed = score >= config.passPercentage;

    const updatedAttempt = await this.quizAttemptRepository.update(attemptId, {
      status: timedOut ? QuizStatus.TIMED_OUT : QuizStatus.COMPLETED,
      answers,
      perQuestionResult,
      score,
      passed: timedOut ? false : passed, // timed-out attempts always fail
      submittedAt: new Date(),
    });

    // Fire-and-forget AI feedback generation in the background
    (async () => {
      try {
        const aiFeedback = await this.aiQuizService.generateFeedbackSummary({
          score,
          passed,
          topics: config.topics,
          strongAreas: Array.from(strongAreas),
          weakAreas: Array.from(weakAreas),
        });

        await this.quizAttemptRepository.update(attemptId, { aiFeedback });
      } catch (error) {
        console.error('Background AI feedback generation failed:', error);
      }
    })();

    if (passed) {
      const enrollment = await this.enrollmentReadRepo.findEnrollment(
        userId,
        attempt.courseId,
      );
      if (enrollment) {
        await this.enrollmentWriteRepo.updateProgress(
          enrollment.enrollmentId!,
          100,
          EnrollmentStatus.COMPLETED,
          new Date(),
        );
      }

      // Award XP for passing the quiz (fire-and-forget)
      const xpEarned = correctCount * XP_PER_CORRECT_ANSWER + XP_BONUS_PASS;
      this.studentRepository
        .recordActivity(userId, xpEarned)
        .catch((err) =>
          console.error('Failed to record quiz XP activity:', err),
        );
    } else if (!timedOut) {
      // Still award partial XP for attempting (fire-and-forget)
      const xpEarned = correctCount * XP_PER_CORRECT_ANSWER;
      if (xpEarned > 0) {
        this.studentRepository
          .recordActivity(userId, xpEarned)
          .catch((err) =>
            console.error('Failed to record partial quiz XP activity:', err),
          );
      }
    }

    return QuizAttemptMapper.toDto(updatedAttempt!);
  }
}
