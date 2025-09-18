import DurationConverter from '../../../../shared/utils/DurationConverter';
import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { Course } from '../../domain/entities/Course';

export class UpdateBaseUseCase {
  constructor(private readonly repo: ICourseRepository) {}


  async execute(
    courseId: string,
    instructorId: string,
    data: {
      title?: string;
      subText?: string;
      category?: string;
      courseLevel?: string;
      language?:string;
      features?: string[];
      duration?: Date | string | undefined;
      description?: string;
      price?: number;
      thumbnailUrl?: string;
      tags?: string[];
    },
  ): Promise<void> {
    const course = await this.repo.findById(courseId);
    if (!course) throw new Error('Course not found');
    if (course.instructorId !== instructorId) throw new Error('Unauthorized');

    const { duration, ...rest } = data;
    const updateData: Partial<Course> = rest;
    if (duration) {
      if (typeof duration === 'string') {
        updateData.duration = DurationConverter(duration);
      } else {
        updateData.duration = duration;
      }
    }

    await this.repo.update(courseId, updateData);
  }
}
