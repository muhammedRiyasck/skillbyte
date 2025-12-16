import { Course } from '../../domain/entities/Course';

export interface ICreateCourseData {
  instructorId: string;
  thumbnailUrl: string | null;
  title: string;
  subText: string;
  category: string;
  courseLevel: string;
  language: string;
  price: number;
  features: string[];
  description: string;
  duration: string;
  tags: string[];
  status: 'draft';
}

export interface ICreateBaseUseCase {
  execute(data: ICreateCourseData): Promise<Course>;
}
