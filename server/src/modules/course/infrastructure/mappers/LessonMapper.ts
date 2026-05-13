import { Lesson } from '../../domain/entities/Lesson';
import { ILessonDoc } from '../models/LessonModel';
import { ContentType } from '../../../../shared/enums/ContentType';

export class LessonMapper {
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
      doc._id.toString(),
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
