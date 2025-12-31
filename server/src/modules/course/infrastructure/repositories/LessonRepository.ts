import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { Lesson } from '../../domain/entities/Lesson';
import { LessonModel, ILessonDoc } from '../models/LessonModel';

export class LessonRepository
  extends BaseRepository<Lesson, ILessonDoc>
  implements ILessonRepository
{
  constructor() {
    super(LessonModel);
  }

  toEntity(doc: ILessonDoc): Lesson {
    return new Lesson(
      doc.moduleId.toString(),
      doc.title,
      doc.description,
      doc.contentType,
      doc.fileName,
      doc.order,
      doc.duration,
      doc.resources,
      doc.isFreePreview,
      doc.isPublished,
      doc.isBlocked,
      doc._id.toString(),
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async findByModuleId(moduleIds: string[]): Promise<Lesson[]> {
    const docs = await this.model.find({ moduleId: { $in: moduleIds } }).sort({
      order: 1,
    });
    return docs.map((doc) => this.toEntity(doc));
  }

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
    });

    return this.toEntity(doc);
  }

  async updateLessonById(
    lessonId: string,
    updates: Partial<Lesson>,
  ): Promise<void> {
    await this.model.findByIdAndUpdate(lessonId, updates, { new: true });
  }

  async deleteManyByModuleId(moduleId: string): Promise<void> {
    await this.model.deleteMany({ moduleId });
  }

  async deleteManyByModuleIds(moduleIds: string[]): Promise<void> {
    await this.model.deleteMany({ moduleId: { $in: moduleIds } });
  }
}
