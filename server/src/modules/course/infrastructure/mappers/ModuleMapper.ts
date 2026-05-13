import { Module } from '../../domain/entities/Module';
import { IModuleDoc } from '../models/ModuleModel';

export class ModuleMapper {
  static toEntity(doc: IModuleDoc): Module {
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
}
