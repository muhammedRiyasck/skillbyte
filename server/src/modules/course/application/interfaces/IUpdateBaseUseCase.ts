import { Course } from "../../domain/entities/Course";

type UpdatableCourseFields = Omit<
  Course,
  'createdAt' | 'updatedAt' | 'courseId'
>;
type IUpdateBaseInfo = Partial<UpdatableCourseFields>;


export interface IUpdateBaseUseCase {
 execute(
    courseId: string,
    instructorId: string,
    updates: IUpdateBaseInfo,
  ): Promise<void>
}








