import { UserRole } from '../../../../shared/enums/UserRole';

export interface IGetLessonPlayUrlUseCase {
  execute(
    userId: string,
    lessonId: string,
    role: UserRole,
  ): Promise<{ isProcessing?: boolean; hlsUrl?: string; signedUrl?: string }>;
}
