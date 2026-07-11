import { LessonResponseDto } from './LessonDtos';

export interface CreateModuleDto {
  courseId?: string;
  id?: string;
  moduleId: string;
  title: string;
  description?: string;
  order: number;
  lessons?: unknown[];
}

export interface UpdateModuleDto {
  [key: string]: unknown;
}

export interface ModuleResponseDto {
  id?: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonResponseDto[];
  createdAt?: Date;
  updatedAt?: Date;
}
