import { Lesson } from '../../domain/entities/Lesson';
import { ILessonDoc } from '../models/LessonModel';
import { ContentType } from '../../../../shared/enums/ContentType';

/** Handles lesson mapper functionality. */
export class LessonMapper {
  /**
   * To entity for the LessonMapper entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  static toEntity(doc: ILessonDoc): Lesson {
    return new Lesson(
      doc.moduleId.toString(),
      doc.title,
      doc.description,
      doc.contentType as ContentType,
      doc.fileName,
      doc.order,
      doc.duration,
      doc.resources,
      doc.isFreePreview,
      doc.isPublished,
      doc.isBlocked,
      doc.isProcessing,
      doc.hlsUrl,
      doc._id.toString(),
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
