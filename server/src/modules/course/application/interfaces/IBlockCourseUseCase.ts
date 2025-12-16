export interface IBlockCourseUseCase {
  execute(courseId: string, isBlocked: boolean): Promise<void>;
}
