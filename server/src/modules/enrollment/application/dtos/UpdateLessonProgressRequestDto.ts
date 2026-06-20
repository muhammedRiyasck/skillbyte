export interface UpdateLessonProgressRequestDto {
  lessonId: string;
  lastWatchedSecond: number;
  totalDuration: number;
  isCompleted: boolean;
}
