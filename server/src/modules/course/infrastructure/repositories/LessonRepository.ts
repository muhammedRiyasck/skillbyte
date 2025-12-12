import { Lesson } from '../../domain/entities/Lesson';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { LessonModel } from '../models/LessonModel';

export class LessonRepository implements ILessonRepository {
  async save(data: {
    moduleId: string;
    title: string;
    contentType: 'video' | 'pdf';
    contentUrl: string;
    order: number;
  }) {
    const doc = await LessonModel.create(data);
    return new Lesson(
      doc.moduleId.toString(),
      doc.title,
      doc.description,
      doc.contentType,
      doc.fileName,
      doc.order!,
      doc.duration!,
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
    const docs = await LessonModel.find({ moduleId: { $in: moduleIds } }).sort({ order: 1 });
    return docs.map(
      (doc) =>
        new Lesson(
      doc.moduleId.toString(),
      doc.title,
      doc.description,
      doc.contentType,
      doc.fileName,
      doc.order!,
      doc.duration!,
      doc.resources,
      doc.isFreePreview,
      doc.isPublished,
      doc.isBlocked,
      doc._id.toString(),
      doc.createdAt,
      doc.updatedAt,
        ),
    );
  }

  async create(lesson: Lesson): Promise<Lesson> {
    const doc = await LessonModel.create({
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

      return new Lesson(
     doc.moduleId.toString(),
      doc.title,
      doc.description,
      doc.contentType,
      doc.fileName,
      doc.order!,
      doc.duration!,
      doc.resources,
      doc.isFreePreview,
      doc.isPublished,
      doc.isBlocked,
      doc._id.toString(),
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async updateLessonById(lessonId: string, updates: Partial<Lesson>): Promise<void> {
    await LessonModel.findByIdAndUpdate(lessonId, updates, { new: true });
  }

  async findById(id: string): Promise<Lesson | null> {
    const doc = await LessonModel.findById(id);
    if (!doc) return null;

    return new Lesson(
     doc.moduleId.toString(),
      doc.title,
      doc.description,
      doc.contentType,
      doc.fileName,
      doc.order!,
      doc.duration!,
      doc.resources,
      doc.isFreePreview,
      doc.isPublished,
      doc.isBlocked,
      doc._id.toString(),
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async deleteById(lessonId: string): Promise<void> {
    await LessonModel.findByIdAndDelete(lessonId);
  }

  async deleteManyByModuleId(moduleId: string): Promise<void> {
    await LessonModel.deleteMany({ moduleId });
  }
  async deleteManyByModuleIds(moduleIds: string[]): Promise<void> {
    await LessonModel.deleteMany({ moduleId: { $in: moduleIds } });
  }
}
