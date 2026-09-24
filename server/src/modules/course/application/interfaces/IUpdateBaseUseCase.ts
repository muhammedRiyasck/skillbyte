import { UpdateBaseValidationType } from '../dtos/CourseDetailsDtos';

export interface IUpdateBaseUseCase {
  execute(
    courseId: string,
    instructorId: string,
    validatedData: UpdateBaseValidationType,
  ): Promise<void>;
}
