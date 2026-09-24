import { IChatNotifier } from '../../application/interfaces/IChatNotifier';
import { MessageResponseDto } from '../../application/dtos/MessageResponseDto';
import { SocketService } from '../../../../shared/services/socket/SocketService';

/** Handles socket chat notifier functionality. */
export class SocketChatNotifier implements IChatNotifier {
  /**
   * Notify new message for the SocketChatNotifier entity.
   *
   * @param recipientId - The unique identifier for the recipient.
   * @param conversationId - The unique identifier for the conversation.
   * @param message - The message information.
   */
  notifyNewMessage(
    recipientId: string,
    conversationId: string,
    message: MessageResponseDto,
  ): void {
    // Emit to conversation room (for people already in the chat window)
    SocketService.getInstance()
      .getIO()
      .to(`conversation:${conversationId}`)
      .emit('chat:new-message', message);

    // Emit to recipient's personal room (for global notifications and list updates)
    SocketService.getInstance().emitToUser(
      recipientId,
      'chat:new-message',
      message,
    );
  }

  /**
   * Notify conversation updated for the SocketChatNotifier entity.
   *
   * @param userId - The unique identifier for the user.
   * @param conversationId - The unique identifier for the conversation.
   */
  notifyConversationUpdated(userId: string, conversationId: string): void {
    SocketService.getInstance().emitToUser(
      userId,
      'chat:conversation-updated',
      { conversationId },
    );
  }

  /**
   * Notify messages read for the SocketChatNotifier entity.
   *
   * @param conversationId - The unique identifier for the conversation.
   * @param readerUserId - The unique identifier for the readerUser.
   */
  notifyMessagesRead(conversationId: string, readerUserId: string): void {
    SocketService.getInstance().emitToConversation(
      conversationId,
      'chat:messages-read',
      {
        conversationId,
        userId: readerUserId,
        timestamp: new Date(),
      },
    );
  }
}
