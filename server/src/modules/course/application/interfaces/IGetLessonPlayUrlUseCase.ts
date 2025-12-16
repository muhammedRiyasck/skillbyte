export interface IGetLessonPlayUrlUseCase {
  execute(
    userId: string,
    lessonId: string,
    role: string,
  ): Promise<{ signedUrl: string }>;
}
