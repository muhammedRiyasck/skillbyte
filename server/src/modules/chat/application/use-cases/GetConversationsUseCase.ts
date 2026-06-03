import {
  IGetConversationsUseCase,
  IGetConversationsData,
} from '../interfaces/IGetConversationsUseCase';
import { IConversationReadRepository } from '../../domain/IRepositories/IConversationReadRepository';
import { IStudentRepository } from '../../../student/domain/IRepositories/IStudentRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { IConversation } from '../../domain/entities/Conversation';
import { ConversationResponseMapper } from '../mappers/ConversationResponseMapper';
import { ConversationResponseDto } from '../dtos/ConversationResponseDto';

export class GetConversationsUseCase implements IGetConversationsUseCase {
  constructor(
    private conversationReadRepository: IConversationReadRepository,
    private studentRepository: IStudentRepository,
    private instructorRepository: IInstructorRepository,
    private courseRepository: ICourseRepository,
  ) {}

  async execute(
    data: IGetConversationsData,
  ): Promise<ConversationResponseDto[]> {
    const { userId, role } = data;
    const conversations = await this.conversationReadRepository.findAllByUserId(
      userId,
      role,
    );

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

    const populatedConversations = conversations.map((conversation) => {
      const student = studentsById.get(conversation.studentId);
      const instructor = instructorsById.get(conversation.instructorId);
      const course = coursesById.get(conversation.courseId);

      return {
        ...conversation,
        conversationId: conversation.conversationId,
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
      } as IConversation;
    });

    return populatedConversations.map((conv) =>
      ConversationResponseMapper.toDto(conv),
    );
  }
}
