import { IGetQuizAnalyticsUseCase } from '../interfaces/IGetQuizAnalyticsUseCase';
import { QuizAnalyticsResponseDto } from '../dtos/QuizAnalyticsResponseDto';
import { IQuizAttemptRepository } from '../../domain/IRepositories/IQuizAttemptRepository';
import { IQuizConfigRepository } from '../../domain/IRepositories/IQuizConfigRepository';
import { IQuizAttempt } from '../../domain/entities/QuizAttempt';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class GetQuizAnalyticsUseCase implements IGetQuizAnalyticsUseCase {
  constructor(
    private quizAttemptRepository: IQuizAttemptRepository,
    private quizConfigRepository: IQuizConfigRepository,
  ) {}

  async execute(
    courseId: string,
    instructorId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<QuizAnalyticsResponseDto> {
    const config = await this.quizConfigRepository.findByCourseId(courseId);
    if (!config) {
      return {
        totalStudents: 0,
        averageScore: 0,
        passRate: 0,
        studentAttempts: [],
        currentPage: page,
        totalPages: 0,
        passPercentage: 0,
      };
    }

    if (config.instructorId.toString() !== instructorId.toString()) {
      throw new HttpError(
        'Unauthorized to access analytics',
        HttpStatusCode.FORBIDDEN,
      );
    }

    const rawAttempts =
      (await this.quizAttemptRepository.findAttemptsWithStudentDetails(
        courseId,
      )) as (IQuizAttempt & { createdAt: Date })[];

    if (rawAttempts.length === 0) {
      return {
        totalStudents: 0,
        averageScore: 0,
        passRate: 0,
        studentAttempts: [],
        currentPage: page,
        totalPages: 0,
        passPercentage: config.passPercentage,
      };
    }

    interface StudentGroup {
      userId: string;
      name: string;
      email: string;
      profilePicture?: string;
      attemptsCount: number;
      bestScore: number;
      passed: boolean;
      overallStatus: 'PASSED' | 'FAILED' | 'IN_PROGRESS';
      attempts: {
        attemptNumber: number;
        score: number;
        correctAnswersCount: number;
        totalQuestions: number;
        passed: boolean;
        status: string;
        startedAt: Date;
        submittedAt?: Date;
      }[];
      lastAttemptAt: Date;
    }

    // Group attempts by student
    const studentGroups = new Map<string, StudentGroup>();

    rawAttempts.forEach((attempt) => {
      const student = attempt.userId as unknown as {
        _id: { toString: () => string };
        name: string;
        email: string;
        profilePicture?: string;
      };
      if (!student || !student._id) return;

      const studentId = student._id.toString();

      if (!studentGroups.has(studentId)) {
        studentGroups.set(studentId, {
          userId: studentId,
          name: student.name,
          email: student.email,
          profilePicture: student.profilePicture,
          attemptsCount: 0,
          bestScore: 0,
          passed: false,
          overallStatus: 'FAILED',
          attempts: [],
          lastAttemptAt: new Date(attempt.createdAt),
        });
      }

      const group = studentGroups.get(studentId)!;
      group.attemptsCount++;
      group.bestScore = Math.max(group.bestScore, attempt.score);
      if (attempt.passed) group.passed = true;
      if (new Date(attempt.createdAt) > group.lastAttemptAt) {
        group.lastAttemptAt = new Date(attempt.createdAt);
      }
      group.attempts.push({
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        correctAnswersCount:
          attempt.perQuestionResult?.filter(
            (r: { isCorrect: boolean }) => r.isCorrect,
          ).length || 0,
        totalQuestions: attempt.questions?.length || 0,
        passed: attempt.passed,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
      });
    });

    // Post-process to calculate overallStatus correctly and sort attempts
    const processedStudentAttempts = Array.from(studentGroups.values()).map(
      (group) => {
        // Sort attempts by attemptNumber
        group.attempts.sort((a, b) => a.attemptNumber - b.attemptNumber);

        if (group.passed) {
          group.overallStatus = 'PASSED';
        } else if (group.attempts.some((a) => a.status === 'in_progress')) {
          group.overallStatus = 'IN_PROGRESS';
        } else {
          group.overallStatus = 'FAILED';
        }

        return {
          ...group,
          lastAttemptAt: group.lastAttemptAt.toISOString(),
        };
      },
    );

    // Calculate Global Metrics (before pagination)
    const totalStudents = processedStudentAttempts.length;
    const sumOfBestScores = processedStudentAttempts.reduce(
      (sum, s) => sum + s.bestScore,
      0,
    );
    const averageScore = Math.round(sumOfBestScores / (totalStudents || 1));

    const passedStudentsList = processedStudentAttempts.filter((s) => s.passed);
    const studentsPassedCount = passedStudentsList.length;

    const passRate = Math.round(
      (studentsPassedCount / (totalStudents || 1)) * 100,
    );

    // Sort by lastAttemptAt descending (default for analytics)
    processedStudentAttempts.sort(
      (a, b) =>
        new Date(b.lastAttemptAt).getTime() -
        new Date(a.lastAttemptAt).getTime(),
    );

    // Apply Pagination
    const startIndex = (page - 1) * limit;
    const paginatedStudents = processedStudentAttempts.slice(
      startIndex,
      startIndex + limit,
    );
    const totalPages = Math.ceil(totalStudents / limit);

    return {
      totalStudents,
      averageScore,
      passRate,
      studentAttempts:
        paginatedStudents as unknown as QuizAnalyticsResponseDto['studentAttempts'],
      currentPage: page,
      totalPages,
      passPercentage: config.passPercentage,
    };
  }
}
