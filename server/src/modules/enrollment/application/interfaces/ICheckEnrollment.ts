export interface ICheckEnrollment {
  execute(userId: string, courseId: string): Promise<boolean>;
}
