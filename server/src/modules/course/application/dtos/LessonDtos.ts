export interface CreateLessonDto {
  moduleId: string;
  title: string;
  description?: string;
  contentType: 'video' | 'pdf';
  fileName: string;
  order: number;
  duration?: number;
  resources?: string[];
  isFreePreview?: boolean;
  isPublished?: boolean;
}

export interface UpdateLessonDto {
  [key: string]: unknown;
}
