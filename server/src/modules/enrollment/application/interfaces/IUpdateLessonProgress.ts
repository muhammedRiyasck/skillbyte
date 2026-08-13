import { EnrollmentResponseDto } from '../dtos/EnrollmentResponseDto';
import { UpdateLessonProgressRequestDto } from '../dtos/UpdateLessonProgressRequestDto';

export interface IUpdateLessonProgressUseCase {
  execute(
    enrollmentId: string,
    lessonId: string,
    metaData: Omit<UpdateLessonProgressRequestDto, 'lessonId'>,
  ): Promise<EnrollmentResponseDto | null>;
}
