import { Course } from '../../domain/entities/Course';
import { ICourseDoc } from '../models/CourseModel';
import { CourseStatus } from '../../../../shared/enums/CourseStatus';

/** Handles course mapper functionality. */
export class CourseMapper {
  /**
   * To entity for the CourseMapper entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  static toEntity(doc: ICourseDoc): Course {
    return new Course(
      doc.instructorId.toString(),
      doc.thumbnailUrl,
      doc.title,
      doc.subText,
      doc.category,
      doc.courseLevel,
      doc.language,
      doc.price,
      doc.features,
      doc.description,
      doc.duration,
      doc.tags,
      doc.status as CourseStatus,
      doc.isBlocked,
      doc._id.toString(),
      doc.createdAt,
      doc.updatedAt,
      undefined,
      doc.averageRating || 0,
      doc.totalReviews || 0,
    );
  }
}
