import { IMarkMessagesAsReadUseCase } from '../interfaces/IMarkMessagesAsReadUseCase';
import { IMessageWriteRepository } from '../../domain/IRepositories/IMessageRepository';
import { IConversationWriteRepository } from '../../domain/IRepositories/IConversationWriteRepository.ts';
import { SocketService } from '../../../../shared/services/socket-service.ts/SocketService';

export class MarkMessagesAsReadUseCase implements IMarkMessagesAsReadUseCase {
  constructor(
    private messageWriteRepository: IMessageWriteRepository,
    private conversationWriteRepository: IConversationWriteRepository,
  ) {}

  async execute(
    conversationId: string,
    userId: string,
    role: 'student' | 'instructor',
  ): Promise<void> {
    // Mark all messages as read for this user
    await this.messageWriteRepository.markAllAsRead(conversationId, userId);

    // Reset unread count for this user
    await this.conversationWriteRepository.resetUnreadCount(
      conversationId,
      role,
    );

    // Emit read receipt via Socket.IO
    SocketService.getInstance().emitToConversation(
      conversationId,
      'chat:messages-read',
      {
        conversationId,
        userId,
        timestamp: new Date(),
      },
    );

    // Emit update to the user who read it so their unread count badge updates instantly
    SocketService.getInstance().emitToUser(
      userId,
      'chat:conversation-updated',
      {
        conversationId,
      },
    );
  }
}
