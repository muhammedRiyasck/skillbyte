import {
  ISendMessageUseCase,
  ISendMessageData,
} from '../interfaces/ISendMessageUseCase';
import { IMessageWriteRepository } from '../../domain/IRepositories/IMessageRepository';
import { IConversationWriteRepository } from '../../domain/IRepositories/IConversationWriteRepository';
import { IConversationReadRepository } from '../../domain/IRepositories/IConversationReadRepository';
import { IMessage } from '../../domain/entities/Message';
import { SocketService } from '../../../../shared/services/socket-service.ts/SocketService';
import { ICreateNotificationUseCase } from '../../../notification/application/interfaces/ICreateNotificationUseCase';
import logger from '../../../../shared/utils/Logger';

export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    private messageWriteRepository: IMessageWriteRepository,
    private conversationWriteRepository: IConversationWriteRepository,
    private conversationReadRepository: IConversationReadRepository,
    private createNotificationUseCase?: ICreateNotificationUseCase,
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

      // 4. Create a push notification for the recipient
      if (this.createNotificationUseCase) {
        const preview =
          content && content.length > 50
            ? content.substring(0, 50) + '...'
            : content || 'Sent a file';

        this.createNotificationUseCase
          .execute({
            userId: recipientId,
            title: 'New Message',
            message: preview,
            type: 'info',
          })
          .catch((err) => {
            logger.error('Failed to create notification', err);
          });
      }
    }

    return savedMessage;
  }
}
