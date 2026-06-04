import { MessageResponseDto } from '../dtos/MessageResponseDto';

export interface IChatNotifier {
  notifyNewMessage(
    recipientId: string,
    conversationId: string,
    message: MessageResponseDto,
  ): void;
  notifyConversationUpdated(userId: string, conversationId: string): void;
  notifyMessagesRead(conversationId: string, readerUserId: string): void;
}
