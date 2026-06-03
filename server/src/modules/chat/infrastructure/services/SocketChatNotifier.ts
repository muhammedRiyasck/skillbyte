import { IChatNotifier } from '../../application/interfaces/IChatNotifier';
import { IMessage } from '../../domain/entities/Message';
import { SocketService } from '../../../../shared/services/socket/SocketService';

export class SocketChatNotifier implements IChatNotifier {
  notifyNewMessage(
    recipientId: string,
    conversationId: string,
    message: IMessage,
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

  notifyConversationUpdated(userId: string, conversationId: string): void {
    SocketService.getInstance().emitToUser(
      userId,
      'chat:conversation-updated',
      { conversationId },
    );
  }

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
