import { Lesson } from '../../domain/entities/Lession';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { LessonModel } from '../models/LessonModel';

export class MongoLessonRepository implements ILessonRepository {
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
      doc.contentType,
      doc.contentUrl,
      doc.order,
      doc._id.toString(),
      doc.createdAt,
      doc.updatedAt,
    );
  }
  async findByModuleId(moduleId: string): Promise<Lesson[]> {
    const docs = await LessonModel.find({ moduleId }).sort({ order: 1 });
    return docs.map(
      (doc) =>
        new Lesson(
          doc.moduleId.toString(),
          doc.title,
          doc.contentType,
          doc.contentUrl,
          doc.order,
          doc._id.toString(),
          doc.createdAt,
          doc.updatedAt,
        ),
    );
  }

  async create(lesson: Lesson): Promise<void> {
    await LessonModel.create({
      moduleId: lesson.moduleId,
      title: lesson.title,
      contentType: lesson.contentType,
      contentUrl: lesson.contentUrl,
      order: lesson.order,
    });
  }

  async updateById(lessonId: string, updates: Partial<Lesson>): Promise<void> {
    await LessonModel.findByIdAndUpdate(lessonId, updates, { new: true });
  }

  async findById(id: string): Promise<Lesson | null> {
    const doc = await LessonModel.findById(id);
    if (!doc) return null;

    return new Lesson(
      doc.moduleId.toString(),
      doc.title,
      doc.contentType,
      doc.contentUrl,
      doc.order,
      doc._id.toString(),
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
