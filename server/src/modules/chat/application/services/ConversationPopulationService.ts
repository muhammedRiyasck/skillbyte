import { IConversation } from '../../domain/entities/Conversation';
import { IStudentRepository } from '../../../student/domain/IRepositories/IStudentRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';

export interface IConversationPopulationService {
  populateOne(conversation: IConversation): Promise<IConversation>;
  populateMany(conversations: IConversation[]): Promise<IConversation[]>;
}

export class ConversationPopulationService
  implements IConversationPopulationService
{
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly instructorRepository: IInstructorRepository,
    private readonly courseRepository: ICourseRepository,
  ) {}

  async populateOne(conversation: IConversation): Promise<IConversation> {
    const [student, instructor, course] = await Promise.all([
      this.studentRepository.findById(conversation.studentId),
      this.instructorRepository.findById(conversation.instructorId),
      this.courseRepository.findById(conversation.courseId),
    ]);

    return {
      ...conversation,
      student: student
        ? {
            id: student.studentId!,
            name: student.name,
            email: student.email,
            profilePicture: student.profilePictureUrl || undefined,
          }
        : null,
      instructor: instructor
        ? {
            id: instructor.instructorId!,
            name: instructor.name,
            email: instructor.email,
            profilePicture: instructor.profilePictureUrl || undefined,
            jobTitle: instructor.jobTitle,
            experience: String(instructor.experience),
          }
        : null,
      course: course
        ? {
            id: course.courseId!,
            title: course.title,
            thumbnail: course.thumbnailUrl || undefined,
          }
        : null,
    };
  }

  async populateMany(conversations: IConversation[]): Promise<IConversation[]> {
    if (conversations.length === 0) return [];

    const studentIds = [...new Set(conversations.map((c) => c.studentId))];
    const instructorIds = [
      ...new Set(conversations.map((c) => c.instructorId)),
    ];
    const courseIds = [...new Set(conversations.map((c) => c.courseId))];

    const [students, instructors, courses] = await Promise.all([
      this.studentRepository.findByIds(studentIds),
      this.instructorRepository.findByIds(instructorIds),
      this.courseRepository.findByIds(courseIds),
    ]);

    const studentsById = new Map(students.map((s) => [s.studentId, s]));
    const instructorsById = new Map(
      instructors.map((i) => [i.instructorId, i]),
    );
    const coursesById = new Map(courses.map((c) => [c.courseId, c]));

    return conversations.map((conversation) => {
      const student = studentsById.get(conversation.studentId);
      const instructor = instructorsById.get(conversation.instructorId);
      const course = coursesById.get(conversation.courseId);

      return {
        ...conversation,
        student: student
          ? {
              id: student.studentId!,
              name: student.name,
              email: student.email,
              profilePicture: student.profilePictureUrl || undefined,
            }
          : null,
        instructor: instructor
          ? {
              id: instructor.instructorId!,
              name: instructor.name,
              email: instructor.email,
              profilePicture: instructor.profilePictureUrl || undefined,
              jobTitle: instructor.jobTitle,
              experience: String(instructor.experience),
            }
          : null,
        course: course
          ? {
              id: course.courseId!,
              title: course.title,
              thumbnail: course.thumbnailUrl || undefined,
            }
          : null,
      };
    });
  }
}
