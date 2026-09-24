import { IMessage } from '../../domain/entities/Message';
import { MessageResponseDto } from '../dtos/MessageResponseDto';

/** Handles message response mapper functionality. */
export class MessageResponseMapper {
  /**
   * To dto for the MessageResponseMapper entity.
   *
   * @param message - The message information.
   * @returns The standardized HTTP response.
   */
  static toDto(message: IMessage): MessageResponseDto {
    return {
      messageId: message.messageId!,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      content: message.content || '',
      type: message.type,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      isRead: message.isRead,
      readAt: message.readAt,
      createdAt: message.createdAt!,
    };
  }
}
