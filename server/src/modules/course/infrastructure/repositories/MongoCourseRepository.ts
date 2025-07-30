import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { Course } from "../../domain/entities/Course";
import { CourseModel } from "../models/CourseModel";

export class MongoCourseRepository implements ICourseRepository {

  async save(course: Course): Promise<Course> {
    const created = await CourseModel.create({
      instructorId: course.instructorId,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      price: course.price,
      category: course.category,
      tags: course.tags,
      isPublished: course.status
    });

    return new Course(
      created.instructorId.toString(),
      created.title,
      created.description,
      created.thumbnailUrl,
      created.price,
      created.category,
      created.tags,
      created.status,
       created._id.toString(),
      created.createdAt,
      created.updatedAt
    );
  }

  async findById(id: string): Promise<Course | null> {
  const doc = await CourseModel.findById(id);
  if (!doc) return null;
  return new Course(
    doc.instructorId.toString(),
    doc.title,
    doc.description,
    doc.thumbnailUrl,
    doc.price,
    doc.category,
    doc.tags,
    doc.status,
    doc._id.toString(),
    doc.createdAt,
    doc.updatedAt
  );
}

async findPublishedCourses(filters: {
  search?: string;
  category?: string;
  price?: 'free' | 'paid';
}): Promise<Course[]> {

  const query: any = { status: "published" };

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { tags: { $regex: filters.search, $options: "i" } }
    ];
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.price === "free") {
    query.price = 0;
  } else if (filters.price === "paid") {
    query.price = { $gt: 0 };
  }

  console.log("Querying courses with filters:", query);

  const docs = await CourseModel.find(query).populate("instructorId", "name");

  return docs.map(doc => new Course(
    doc.instructorId._id.toString(),
    doc.title,
    doc.description,
    doc.thumbnailUrl,
    doc.price,
    doc.category,
    doc.tags,
    doc.status,
    doc._id.toString(),
    doc.createdAt,
    doc.updatedAt
  ));
}

async findByInstructorId(instructorId: string): Promise<Course[]> {
  const docs = await CourseModel.find({ instructorId });

  return docs.map(doc => new Course(
    doc.instructorId.toString(),
    doc.title,
    doc.description,
    doc.thumbnailUrl,
    doc.price,
    doc.category,
    doc.tags,
    doc.status,
    doc._id.toString(),
    doc.createdAt,
    doc.updatedAt
  ));
}

async findAllForAdmin(filters: {
  instructorId?: string;
  status?: string;
  category?: string;
  search?: string;
}): Promise<Course[]> {
  const query: any = {};

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
      { title: { $regex: filters.search, $options: "i" } },
      { tags: { $regex: filters.search, $options: "i" } }
    ];
  }

  const docs = await CourseModel.find(query)
    .populate("instructorId", "name email");

  return docs.map(doc => new Course(
    doc.instructorId._id.toString(),
    doc.title,
    doc.description,
    doc.thumbnailUrl,
    doc.price,
    doc.category,
    doc.tags,
    doc.status,
    doc._id.toString(),
    doc.createdAt,
    doc.updatedAt
  ));
}

async update(courseId: string, updatedFields: Partial<Course>): Promise<void> {
  await CourseModel.findByIdAndUpdate(courseId, updatedFields, { new: true });
}


async updateStatus(courseId: string, status: "published" | "unpublished"): Promise<void> {
  await CourseModel.findByIdAndUpdate(courseId, { status });
}

async deleteById(courseId: string): Promise<void> {
  await CourseModel.findByIdAndDelete(courseId);
}

}
