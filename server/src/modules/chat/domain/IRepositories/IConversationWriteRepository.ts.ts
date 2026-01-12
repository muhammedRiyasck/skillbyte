import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import { IConversation } from '../entities/Conversation';



export interface IConversationWriteRepository {
  save(conversation: IConversation): Promise<IConversation>;
  updateLastMessage(
    conversationId: string,
    message: { content: string; senderId: string; timestamp: Date },
  ): Promise<void>;
  incrementUnreadCount(
    conversationId: string,
    role: 'student' | 'instructor',
  ): Promise<void>;
  resetUnreadCount(
    conversationId: string,
    role: 'student' | 'instructor',
  ): Promise<void>;
}
