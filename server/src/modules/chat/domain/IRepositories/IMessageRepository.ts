import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import { IMessage } from '../entities/Message';

export interface IMessageReadRepository extends IBaseRepository<IMessage> {
  findByConversationId(
    conversationId: string,
    limit?: number,
    offset?: number,
  ): Promise<IMessage[]>;
  countUnreadMessages(conversationId: string, userId: string): Promise<number>;
}

export interface IMessageWriteRepository {
  save(message: IMessage): Promise<IMessage>;
  markAsRead(messageId: string): Promise<void>;
  markAllAsRead(conversationId: string, userId: string): Promise<void>;
}
