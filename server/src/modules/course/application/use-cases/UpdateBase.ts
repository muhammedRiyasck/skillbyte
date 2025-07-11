import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';

export class UpdateBaseUseCase {
  constructor(private readonly repo: ICourseRepository) {}

  async excute(
    courseId: string,
    instructorId: string,
    data: {
      title?: string;
      description?: string;
      price?: number;
      thumbnailUrl?: string;
      tags?: string[];
      category?: string;
    },
  ): Promise<void> {
    const course = await this.repo.findById(courseId);
    if (!course) throw new Error('Course not found');
    if (course.instructorId !== instructorId) throw new Error('Unauthorized');

    await this.repo.update(courseId, data);
  }
}
