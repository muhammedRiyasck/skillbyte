import { Module } from '../../domain/entities/Module';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { ModuleModel } from '../models/ModuleModel';

export class ModuleRepository implements IModuleRepository {
  async save(data: {
    courseId: string;
    title: string;
    description: string;
    order: number;
  }): Promise<Module> {
    const doc = await ModuleModel.create(data);
    return new Module(
      doc.courseId.toString(),
      doc.title,
      doc.description,
      doc.order,
      doc.createdAt,
      doc.updatedAt,
      doc._id.toString(),
    );
  }

  async findModulesByCourseId(courseId: string): Promise<Module[]> {
    const docs = await ModuleModel.find({ courseId }).sort({ order: 1 });
    return docs.map(
      (doc) =>
        new Module(
          doc.courseId.toString(),
          doc.title,
          doc.description,
          doc.order,
          doc.createdAt,
          doc.updatedAt,
          doc._id.toString(),
        ),
    );
  }

  async findById(moduleId: string): Promise<Module | null> {
    const doc = await ModuleModel.findById(moduleId);
    if (!doc) {
      return null;
    }
    return new Module(
      doc.courseId.toString(),
      doc.title,
      doc.description,
      doc.order,
      doc.createdAt,
      doc.updatedAt,
      doc._id.toString(),
    );
  }

  async updateModuleById(
    moduleId: string,
    updates: Partial<Module>,
  ): Promise<void> {
    await ModuleModel.findByIdAndUpdate(moduleId, updates, { new: true });
  }

  async deleteById(moduleId: string): Promise<void> {
    await ModuleModel.findByIdAndDelete(moduleId);
  }

  async deleteManyByCourseId(courseId: string): Promise<void> {
    await ModuleModel.deleteMany({ courseId });
  }
}
