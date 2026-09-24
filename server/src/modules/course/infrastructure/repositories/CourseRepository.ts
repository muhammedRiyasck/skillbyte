import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { Course } from '../../domain/entities/Course';
import { CourseModel, ICourseDoc } from '../models/CourseModel';
import { CourseMapper } from '../mappers/CourseMapper';
import { CourseStatus } from '../../../../shared/enums/CourseStatus';

/** Manages database operations for course. */
export class CourseRepository
  extends BaseRepository<Course, ICourseDoc>
  implements ICourseRepository
{
  constructor() {
    super(CourseModel);
  }

  /**
   * To entity for the Course entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  toEntity(doc: ICourseDoc): Course {
    return CourseMapper.toEntity(doc);
  }

  /**
   * Find published courses for the Course entity.
   *
   * @param filters - The filters information.
   * @returns The result of the operation.
   */
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

  /**
   * Find by ids for the Course entity.
   *
   * @param ids - The unique identifier for the ids.
   * @returns The result of the operation.
   */
  async findByIds(ids: string[]): Promise<Course[]> {
    if (!ids.length) return [];

    const docs = await this.model
      .find({ _id: { $in: ids } })
      .select('instructorId title thumbnailUrl');

    return docs.map((doc) => this.toEntity(doc));
  }

  /**
   * Find all for admin for the Course entity.
   *
   * @param filters - The filters information.
   * @returns The result of the operation.
   */
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

  /**
   * Update base info for the Course entity.
   *
   * @param courseId - The unique identifier for the course.
   * @param updatedFields - The updated fields information.
   */
  async updateBaseInfo(
    courseId: string,
    updatedFields: Partial<Course>,
  ): Promise<void> {
    await this.model.findByIdAndUpdate(courseId, updatedFields, { new: true });
  }

  /**
   * Update status for the Course entity.
   *
   * @param courseId - The unique identifier for the course.
   * @param status - The status information.
   */
  async updateStatus(courseId: string, status: CourseStatus): Promise<void> {
    await this.model.findByIdAndUpdate(courseId, { status });
  }

  /**
   * Block course for the Course entity.
   *
   * @param courseId - The unique identifier for the course.
   * @param isBlocked - The is blocked information.
   */
  async blockCourse(courseId: string, isBlocked: boolean): Promise<void> {
    await this.model.findByIdAndUpdate(courseId, { isBlocked });
  }

  /**
   * Get categories for the Course entity.
   *
   * @returns The result of the operation.
   */
  async getCategories(): Promise<string[]> {
    const categories = await this.model.distinct('category');
    return categories.filter((c): c is string => typeof c === 'string');
  }
}
