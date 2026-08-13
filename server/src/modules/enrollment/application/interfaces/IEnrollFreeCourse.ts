export interface IEnrollFreeCourseUseCase {
  execute(userId: string, courseId: string): Promise<{ enrollmentId: string }>;
}
