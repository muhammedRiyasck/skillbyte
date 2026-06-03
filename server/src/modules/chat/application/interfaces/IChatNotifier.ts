import { IMessage } from '../../domain/entities/Message';

export interface IChatNotifier {
  notifyNewMessage(
    recipientId: string,
    conversationId: string,
    message: IMessage,
  ): void;
  notifyConversationUpdated(userId: string, conversationId: string): void;
  notifyMessagesRead(conversationId: string, readerUserId: string): void;
}
