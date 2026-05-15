import { ISubmitQuizAttemptUseCase } from '../interfaces/ISubmitQuizAttemptUseCase';
import { IQuizAttemptRepository } from '../../domain/IRepositories/IQuizAttemptRepository';
import { IQuizConfigRepository } from '../../domain/IRepositories/IQuizConfigRepository';
import {
  IQuizAttempt,
  IPerQuestionResult,
} from '../../domain/entities/QuizAttempt';
import { StudentAnswer } from '../../domain/entities/StudentAnswer';
import { QuizQuestion } from '../../domain/entities/QuizQuestion';
import { QuizStatus } from '../../../../shared/enums/QuizStatus';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import { IEnrollmentWriteRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentWriteRepository';
import { EnrollmentStatus } from '../../../../shared/enums/EnrollmentStatus';
import { IAIQuizService } from '../../../../shared/services/ai/IAIQuizService';
import { QuizGrader } from '../../domain/utils/QuizGrader';

export class SubmitQuizAttemptUseCase implements ISubmitQuizAttemptUseCase {
  constructor(
    private quizAttemptRepository: IQuizAttemptRepository,
    private quizConfigRepository: IQuizConfigRepository,
    private enrollmentReadRepo: IEnrollmentReadRepository,
    private enrollmentWriteRepo: IEnrollmentWriteRepository,
    private aiQuizService: IAIQuizService,
  ) {}

  async execute(
    attemptId: string,
    userId: string,
    answers: StudentAnswer[],
  ): Promise<IQuizAttempt> {
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
      status: QuizStatus.COMPLETED,
      answers,
      perQuestionResult,
      score,
      passed,
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
    }

    return updatedAttempt!;
  }
}
