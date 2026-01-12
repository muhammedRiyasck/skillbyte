import { IMessage } from '../../domain/entities/Message';

export interface IGetMessagesUseCase {
  execute(
    conversationId: string,
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<IMessage[]>;
}
