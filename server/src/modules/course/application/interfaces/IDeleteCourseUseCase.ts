
export interface IDeleteCourseUseCase {
execute(courseId: string, instructorId: string): Promise<void>
}
