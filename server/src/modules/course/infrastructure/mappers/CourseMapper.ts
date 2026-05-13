import { Course } from '../../domain/entities/Course';
import { ICourseDoc } from '../models/CourseModel';
import { CourseStatus } from '../../../../shared/enums/CourseStatus';

export class CourseMapper {
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
