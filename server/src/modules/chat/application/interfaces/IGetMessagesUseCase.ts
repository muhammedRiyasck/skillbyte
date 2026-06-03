import { IMessage } from '../../domain/entities/Message';

export interface IGetMessagesData {
  conversationId: string;
  userId: string;
  limit?: number;
  offset?: number;
}

export interface IGetMessagesUseCase {
  execute(data: IGetMessagesData): Promise<IMessage[]>;
}
