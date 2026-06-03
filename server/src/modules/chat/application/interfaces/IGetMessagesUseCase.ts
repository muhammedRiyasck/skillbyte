import { MessageResponseDto } from '../dtos/MessageResponseDto';

export interface IGetMessagesData {
  conversationId: string;
  userId: string;
  limit?: number;
  offset?: number;
}

export interface IGetMessagesUseCase {
  execute(data: IGetMessagesData): Promise<MessageResponseDto[]>;
}
