export interface IResetStudentQuizAttemptsUseCase {
  execute(
    courseId: string,
    studentId: string,
    instructorId: string,
  ): Promise<void>;
}
