import { ConversationResponseDto } from '../dtos/ConversationResponseDto';

export interface IGetConversationsData {
  userId: string;
  role: 'student' | 'instructor';
}

export interface IGetConversationsUseCase {
  execute(data: IGetConversationsData): Promise<ConversationResponseDto[]>;
}
