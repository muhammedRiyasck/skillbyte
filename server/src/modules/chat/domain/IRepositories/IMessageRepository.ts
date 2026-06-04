import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import { IMessage } from '../entities/Message';

export interface IMessageReadRepository extends IBaseRepository<IMessage> {
  findByConversationId(
    conversationId: string,
    limit?: number,
    offset?: number,
  ): Promise<IMessage[]>;
}

export interface IMessageWriteRepository {
  save(message: IMessage): Promise<IMessage>;
  markAllAsRead(conversationId: string, userId: string): Promise<void>;
}
