import {
  ICreateConversationUseCase,
  ICreateConversationData,
} from '../interfaces/ICreateConversationUseCase';
import { IConversationWriteRepository } from '../../domain/IRepositories/IConversationWriteRepository';
import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import { IConversation } from '../../domain/entities/Conversation';
import { IConversationReadRepository } from '../../domain/IRepositories/IConversationReadRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { IChatNotifier } from '../interfaces/IChatNotifier';
import { ConversationResponseMapper } from '../mappers/ConversationResponseMapper';
import { ConversationResponseDto } from '../dtos/ConversationResponseDto';
import { IStudentRepository } from '../../../student/domain/IRepositories/IStudentRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';

export class CreateConversationUseCase implements ICreateConversationUseCase {
  constructor(
    private conversationReadRepository: IConversationReadRepository,
    private conversationWriteRepository: IConversationWriteRepository,
    private enrollmentReadRepository: IEnrollmentReadRepository,
    private chatNotifier: IChatNotifier,
    private studentRepository: IStudentRepository,
    private instructorRepository: IInstructorRepository,
    private courseRepository: ICourseRepository,
  ) {}

  async execute(
    data: ICreateConversationData,
  ): Promise<ConversationResponseDto> {
    const { studentId, instructorId, courseId } = data;

    // Verify student is enrolled in the course
    const enrollment = await this.enrollmentReadRepository.findEnrollment(
      studentId,
      courseId,
    );
    if (
      !enrollment ||
      enrollment.status == 'pending' ||
      enrollment.status == 'failed' ||
      enrollment.status == 'refunded' ||
      enrollment.status == 'cancelled'
    ) {
      throw new HttpError(
        'Student must be enrolled in the course to start a conversation',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Check if conversation already exists
    const existingConversation =
      await this.conversationReadRepository.findByParticipants(
        studentId,
        instructorId,
      );

    if (existingConversation) {
      const populatedConversation =
        await this.populateConversation(existingConversation);
      return ConversationResponseMapper.toDto(populatedConversation);
    }

    // Create new conversation
    const newConversation: IConversation = {
      studentId,
      instructorId,
      courseId,
      unreadCount: {
        student: 0,
        instructor: 0,
      },
    };

    const saved = await this.conversationWriteRepository.save(newConversation);

    // Emit update to both participants via notifier
    this.chatNotifier.notifyConversationUpdated(
      studentId,
      saved.conversationId!,
    );
    this.chatNotifier.notifyConversationUpdated(
      instructorId,
      saved.conversationId!,
    );

    const populatedConversation = await this.populateConversation(saved);
    return ConversationResponseMapper.toDto(populatedConversation);
  }

  private async populateConversation(
    conversation: IConversation,
  ): Promise<IConversation> {
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
}
