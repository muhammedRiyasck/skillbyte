import { EnrollmentResponseDto } from '../dtos/EnrollmentResponseDto';
import { UpdateLessonProgressRequestDto } from '../dtos/UpdateLessonProgressRequestDto';

export interface IUpdateLessonProgress {
  execute(
    enrollmentId: string,
    lessonId: string,
    metaData: Omit<UpdateLessonProgressRequestDto, 'lessonId'>,
  ): Promise<EnrollmentResponseDto | null>;
}
