import {
  ISendMessageUseCase,
  ISendMessageData,
} from '../interfaces/ISendMessageUseCase';
import { IMessageWriteRepository } from '../../domain/IRepositories/IMessageRepository';
import {
  IConversationWriteRepository,
  IConversationReadRepository,
} from '../../domain/IRepositories/IConversationWriteRepository.ts';
import { IMessage } from '../../domain/entities/Message';
import { SocketService } from '../../../../shared/services/socket-service.ts/SocketService';

export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    private messageWriteRepository: IMessageWriteRepository,
    private conversationWriteRepository: IConversationWriteRepository,
    private conversationReadRepository: IConversationReadRepository,
  ) {}

  async execute(data: ISendMessageData): Promise<IMessage> {
    const {
      conversationId,
      senderId,
      senderRole,
      content,
      type,
      fileUrl,
      fileName,
    } = data;

    // Create message
    const message: IMessage = {
      conversationId,
      senderId,
      senderRole,
      content,
      type,
      fileUrl,
      fileName,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const savedMessage = await this.messageWriteRepository.save(message);

    // Update conversation's last message
    await this.conversationWriteRepository.updateLastMessage(conversationId, {
      content,
      senderId,
      timestamp: new Date(),
    });

    // Increment unread count for recipient
    const recipientRole = senderRole === 'student' ? 'instructor' : 'student';
    await this.conversationWriteRepository.incrementUnreadCount(
      conversationId,
      recipientRole,
    );

    // Fetch conversation details to get recipientId
    const conversation =
      await this.conversationReadRepository.findById(conversationId);

    if (conversation) {
      const recipientId =
        senderRole === 'student'
          ? conversation.instructorId
          : conversation.studentId;

      const messageWithId = {
        ...savedMessage,
        id: savedMessage.messageId,
      };

      // 1. Emit to conversation room (for people already in the chat window)
      SocketService.getInstance()
        .getIO()
        .to(`conversation:${conversationId}`)
        .emit('chat:new-message', messageWithId);

      // 2. Emit to recipient's personal room (for global notifications and list updates)
      SocketService.getInstance().emitToUser(
        recipientId,
        'chat:new-message',
        messageWithId,
      );

      // 3. Emit conversation update event to refresh the list
      SocketService.getInstance().emitToUser(
        recipientId,
        'chat:conversation-updated',
        { conversationId },
      );
    }

    return savedMessage;
  }
}
