import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { Course } from '../../domain/entities/Course';
import { CourseModel, ICourseDoc } from '../models/CourseModel';

export class CourseRepository
  extends BaseRepository<Course, ICourseDoc>
  implements ICourseRepository
{
  constructor() {
    super(CourseModel);
  }

  toEntity(doc: ICourseDoc): Course {
    return new Course(
      doc.instructorId.toString(),
      doc.thumbnailUrl,
      doc.title,
      doc.subText,
      doc.category,
      doc.courseLevel,
      doc.language,
      doc.price,
      doc.features,
      doc.description,
      doc.duration,
      doc.tags,
      doc.status,
      doc.isBlocked,
      doc._id.toString(),
    );
  }

  async findPublishedCourses(filters: {
    search?: string;
    category?: string;
  }): Promise<Course[]> {
    const query: Record<string, unknown> = { status: 'list' };

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { tags: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.category) {
      query.category = filters.category;
    }

    const docs = await this.model.find(query).populate('instructorId', 'name');

    return docs.map((doc) => this.toEntity(doc));
  }

  async findAllForAdmin(filters: {
    instructorId?: string;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<Course[]> {
    const query: Record<string, unknown> = {};

    if (filters.instructorId) {
      query.instructorId = filters.instructorId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { tags: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const docs = await this.model.find(query);

    return docs.map((doc) => this.toEntity(doc));
  }

  async updateBaseInfo(
    courseId: string,
    updatedFields: Partial<Course>,
  ): Promise<void> {
    await this.model.findByIdAndUpdate(courseId, updatedFields, { new: true });
  }

  async updateStatus(
    courseId: string,
    status: 'list' | 'unlist',
  ): Promise<void> {
    await this.model.findByIdAndUpdate(courseId, { status });
  }

  async blockCourse(courseId: string, isBlocked: boolean): Promise<void> {
    await this.model.findByIdAndUpdate(courseId, { isBlocked });
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.model.distinct('category');
    return categories.filter((c): c is string => typeof c === 'string');
  }
}
