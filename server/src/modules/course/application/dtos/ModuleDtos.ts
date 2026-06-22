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
