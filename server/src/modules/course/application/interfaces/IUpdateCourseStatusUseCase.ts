export interface IUpdateCourseStatusUseCase {
  execute(
    courseId: string,
    instructorId: string,
    status: 'list' | 'unlist',
  ): Promise<void>;
}
