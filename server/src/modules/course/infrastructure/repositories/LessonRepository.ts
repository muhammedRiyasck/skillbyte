import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { Lesson } from '../../domain/entities/Lesson';
import { LessonModel, ILessonDoc } from '../models/LessonModel';
import { LessonMapper } from '../mappers/LessonMapper';
import { ModuleModel } from '../models/ModuleModel';

/** Manages database operations for lesson. */
export class LessonRepository
  extends BaseRepository<Lesson, ILessonDoc>
  implements ILessonRepository
{
  constructor() {
    super(LessonModel);
  }

  /**
   * To entity for the Lesson entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  toEntity(doc: ILessonDoc): Lesson {
    return LessonMapper.toEntity(doc);
  }

  /**
   * Find by module id for the Lesson entity.
   *
   * @param moduleIds - The unique identifier for the modules.
   * @returns The result of the operation.
   */
  async findByModuleId(moduleIds: string[]): Promise<Lesson[]> {
    const docs = await this.model.find({ moduleId: { $in: moduleIds } }).sort({
      order: 1,
    });
    return docs.map((doc) => this.toEntity(doc));
  }

  /**
   * Create for the Lesson entity.
   *
   * @param lesson - The lesson information.
   * @returns The result of the operation.
   */
  async create(lesson: Lesson): Promise<Lesson> {
    const doc = await this.model.create({
      moduleId: lesson.moduleId,
      title: lesson.title,
      description: lesson.description,
      contentType: lesson.contentType,
      fileName: lesson.fileName,
      order: lesson.order,
      duration: lesson.duration,
      resources: lesson.resources,
      isFreePreview: lesson.isFreePreview,
      isPublished: lesson.isPublished,
      isBlocked: lesson.isBlocked,
      isProcessing: lesson.isProcessing,
    });

    return this.toEntity(doc);
  }

  /**
   * Update lesson by id for the Lesson entity.
   *
   * @param lessonId - The unique identifier for the lesson.
   * @param updates - The updates information.
   */
  async updateLessonById(
    lessonId: string,
    updates: Partial<Lesson>,
  ): Promise<void> {
    await this.model.findByIdAndUpdate(lessonId, updates, { new: true });
  }

  /**
   * Delete many by module id for the Lesson entity.
   *
   * @param moduleId - The unique identifier for the module.
   */
  async deleteManyByModuleId(moduleId: string): Promise<void> {
    await this.model.deleteMany({ moduleId });
  }

  /**
   * Delete many by module ids for the Lesson entity.
   *
   * @param moduleIds - The unique identifier for the modules.
   */
  async deleteManyByModuleIds(moduleIds: string[]): Promise<void> {
    await this.model.deleteMany({ moduleId: { $in: moduleIds } });
  }

  /**
   * Count by course id for the Lesson entity.
   *
   * @param courseId - The unique identifier for the course.
   * @returns The result of the operation.
   */
  async countByCourseId(courseId: string): Promise<number> {
    const modules = await ModuleModel.find({ courseId }).select('_id');
    const moduleIds = modules.map((m) => m._id);
    return await this.model.countDocuments({ moduleId: { $in: moduleIds } });
  }

  /**
   * Find lesson ids by course id for the Lesson entity.
   *
   * @param courseId - The unique identifier for the course.
   * @returns The result of the operation.
   */
  async findLessonIdsByCourseId(courseId: string): Promise<string[]> {
    const modules = await ModuleModel.find({ courseId }).select('_id');
    const moduleIds = modules.map((m) => m._id);
    const lessons = await this.model
      .find({ moduleId: { $in: moduleIds }, isBlocked: { $ne: true } })
      .select('_id');
    return lessons.map((l) => l._id.toString());
  }
}
