import {
  ISendMessageUseCase,
  ISendMessageData,
} from '../interfaces/ISendMessageUseCase';
import { IMessageWriteRepository } from '../../domain/IRepositories/IMessageRepository';
import { IConversationWriteRepository } from '../../domain/IRepositories/IConversationWriteRepository';
import { IConversationReadRepository } from '../../domain/IRepositories/IConversationReadRepository';
import { IMessage } from '../../domain/entities/Message';
import { ICreateNotificationUseCase } from '../../../notification/application/interfaces/ICreateNotificationUseCase';
import logger from '../../../../shared/utils/Logger';
import { NotificationType } from '../../../../shared/enums/NotificationType';
import { IChatNotifier } from '../interfaces/IChatNotifier';
import { MessageResponseMapper } from '../mappers/MessageResponseMapper';
import { MessageResponseDto } from '../dtos/MessageResponseDto';

export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    private messageWriteRepository: IMessageWriteRepository,
    private conversationWriteRepository: IConversationWriteRepository,
    private conversationReadRepository: IConversationReadRepository,
    private chatNotifier: IChatNotifier,
    private createNotificationUseCase?: ICreateNotificationUseCase,
  ) {}

  async execute(data: ISendMessageData): Promise<MessageResponseDto> {
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

      // Notify new message via notifier
      this.chatNotifier.notifyNewMessage(
        recipientId,
        conversationId,
        savedMessage,
      );

      // Emit conversation update event to refresh the list
      this.chatNotifier.notifyConversationUpdated(recipientId, conversationId);

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
            type: NotificationType.INFO,
          })
          .catch((err) => {
            logger.error('Failed to create notification', err);
          });
      }
    }

    return MessageResponseMapper.toDto(savedMessage);
  }
}
