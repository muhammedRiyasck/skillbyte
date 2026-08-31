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

export interface LessonResponseDto {
  id?: string;
  moduleId: string;
  title: string;
  description: string;
  contentType: string;
  fileName: string;
  order: number;
  duration: number;
  resources: string[];
  isFreePreview: boolean;
  isPublished: boolean;
  isBlocked: boolean;
  isProcessing: boolean;
  hlsUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
