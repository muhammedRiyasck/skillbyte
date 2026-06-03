import {
  IGetConversationsUseCase,
  IGetConversationsData,
} from '../interfaces/IGetConversationsUseCase';
import { IConversationReadRepository } from '../../domain/IRepositories/IConversationReadRepository';
import { IStudentRepository } from '../../../student/domain/IRepositories/IStudentRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { IConversation } from '../../domain/entities/Conversation';

export class GetConversationsUseCase implements IGetConversationsUseCase {
  constructor(
    private conversationReadRepository: IConversationReadRepository,
    private studentRepository: IStudentRepository,
    private instructorRepository: IInstructorRepository,
    private courseRepository: ICourseRepository,
  ) {}

  async execute(data: IGetConversationsData): Promise<IConversation[]> {
    const { userId, role } = data;
    const conversations = await this.conversationReadRepository.findAllByUserId(
      userId,
      role,
    );

    // Populate conversations with user and course details
    const populatedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const [student, instructor, course] = await Promise.all([
          this.studentRepository.findById(conversation.studentId),
          this.instructorRepository.findById(conversation.instructorId),
          this.courseRepository.findById(conversation.courseId),
        ]);

        return {
          ...conversation,
          conversationId: conversation.conversationId,
          student: student
            ? {
                id: student.studentId,
                name: student.name,
                email: student.email,
                profilePicture: student.profilePictureUrl || undefined,
              }
            : null,
          instructor: instructor
            ? {
                id: instructor.instructorId,
                name: instructor.name,
                email: instructor.email,
                profilePicture: instructor.profilePictureUrl || undefined,
                jobTitle: instructor.jobTitle,
                experience: instructor.experience,
              }
            : null,
          course: course
            ? {
                id: course.courseId,
                title: course.title,
                thumbnail: course.thumbnailUrl || undefined,
              }
            : null,
        } as IConversation;
      }),
    );

    return populatedConversations;
  }
}
