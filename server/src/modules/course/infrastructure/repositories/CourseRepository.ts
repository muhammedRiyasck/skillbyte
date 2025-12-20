import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { Course } from '../../domain/entities/Course';
import { CourseModel } from '../models/CourseModel';

import { Types } from 'mongoose';

export class CourseRepository implements ICourseRepository {
  async save(course: Course): Promise<Course> {
    const created = await CourseModel.create({
      instructorId: course.instructorId,
      thumbnailUrl: course.thumbnailUrl,
      title: course.title,
      subText: course.subText,
      category: course.category,
      courseLevel: course.courseLevel,
      language: course.language,
      price: course.price,
      features: course.features,
      description: course.description,
      duration: course.duration,
      tags: course.tags,
      isPublished: course.status,
    });

    return new Course(
      created.instructorId.toString(),
      created.thumbnailUrl,
      created.title,
      created.subText,
      created.category,
      created.courseLevel,
      created.language,
      created.price,
      created.features,
      created.description,
      created.duration,
      created.tags,
      created.status,
      created.isBlocked,
      created._id.toString(),
    );
  }

  async findById(id: string): Promise<Course | null> {
    const doc = await CourseModel.findById(id);
    if (!doc) return null;
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
      doc.status,
      doc.isBlocked,
      doc._id.toString(),
    );
  }

  async findPublishedCourses(filters: {
    search?: string;
    category?: string;
  }): Promise<Course[]> {
    const query: Record<string, unknown> = { status: 'list' };

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { tags: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.category) {
      query.category = filters.category;
    }

    // if (filters.price === "free") {
    //   query.price = 0;
    // } else if (filters.price === "paid") {
    //   query.price = { $gt: 0 };
    // }

    const docs = await CourseModel.find(query).populate('instructorId', 'name');

    return docs.map(
      (doc) =>
        new Course(
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
          doc.status,
          doc.isBlocked,
          doc._id.toString(),
        ),
    );
  }

  async listPaginated(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<{ data: Course[]; total: number }> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(limit, 50);
    const skip = (safePage - 1) * safeLimit;

    const [rawData, total] = await Promise.all([
      CourseModel.find(filter).sort(sort).skip(skip).limit(safeLimit).lean(),
      CourseModel.countDocuments(filter),
    ]);
    const data: Course[] = rawData.map((doc) => ({
      ...doc,
      instructorId: (doc.instructorId as Types.ObjectId).toString(),
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    }));

    return { data, total };
  }

  async findAllForAdmin(filters: {
    instructorId?: string;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<Course[]> {
    const query: Record<string, unknown> = {};

    if (filters.instructorId) {
      query.instructorId = filters.instructorId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { tags: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const docs = await CourseModel.find(query);
    // .populate("instructorId", "name email");

    return docs.map(
      (doc) =>
        new Course(
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
          doc.status,
          doc.isBlocked,
          doc._id.toString(),
        ),
    );
  }

  async updateBaseInfo(
    courseId: string,
    updatedFields: Partial<Course>,
  ): Promise<void> {
    await CourseModel.findByIdAndUpdate(courseId, updatedFields, { new: true });
  }

  async updateStatus(
    courseId: string,
    status: 'list' | 'unlist',
  ): Promise<void> {
    await CourseModel.findByIdAndUpdate(courseId, { status });
  }

  async blockCourse(courseId: string, isBlocked: boolean): Promise<void> {
    await CourseModel.findByIdAndUpdate(courseId, { isBlocked });
  }

  async deleteById(courseId: string): Promise<void> {
    await CourseModel.findByIdAndDelete(courseId);
  }

  async getCategories(): Promise<string[]> {
    const categories = await CourseModel.distinct('category');
    return categories.filter((c): c is string => typeof c === 'string');
  }
}
