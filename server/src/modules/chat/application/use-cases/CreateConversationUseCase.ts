import {
  ICreateConversationUseCase,
  ICreateConversationData,
} from '../interfaces/ICreateConversationUseCase';
import {
  IConversationWriteRepository,
} from '../../domain/IRepositories/IConversationWriteRepository.ts';
import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import { IConversation } from '../../domain/entities/Conversation';
import { SocketService } from '../../../../shared/services/socket-service.ts/SocketService';
import { IConversationReadRepository } from '../../domain/IRepositories/IConversationReadRepository';

export class CreateConversationUseCase implements ICreateConversationUseCase {
  constructor(
    private conversationReadRepository: IConversationReadRepository,
    private conversationWriteRepository: IConversationWriteRepository,
    private enrollmentReadRepository: IEnrollmentReadRepository,
  ) {}

  async execute(data: ICreateConversationData): Promise<IConversation> {
    const { studentId, instructorId, courseId } = data;

    // Verify student is enrolled in the course
    const enrollment = await this.enrollmentReadRepository.findEnrollment(
      studentId,
      courseId,
    );

    if (!enrollment || enrollment.status !== 'active') {
      throw new Error(
        'Student must be enrolled in the course to start a conversation',
      );
    }

    // Check if conversation already exists
    const existingConversation =
      await this.conversationReadRepository.findByParticipants(
        studentId,
        instructorId,
      );

    if (existingConversation) {
      return existingConversation;
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.conversationWriteRepository.save(newConversation);

    // Emit update to both participants
    SocketService.getInstance().emitToUser(
      studentId,
      'chat:conversation-updated',
      {
        conversationId: saved.conversationId,
      },
    );
    SocketService.getInstance().emitToUser(
      instructorId,
      'chat:conversation-updated',
      {
        conversationId: saved.conversationId,
      },
    );

    return saved;
  }
}
