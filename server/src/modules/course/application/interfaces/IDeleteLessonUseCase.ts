
export interface IDeleteLessonUseCase {
execute(lessonId: string, instructorId: string): Promise<void>
}
