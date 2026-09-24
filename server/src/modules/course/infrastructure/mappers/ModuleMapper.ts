import { Module } from '../../domain/entities/Module';
import { IModuleDoc } from '../models/ModuleModel';

/** Handles module mapper functionality. */
export class ModuleMapper {
  /**
   * To entity for the ModuleMapper entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
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
