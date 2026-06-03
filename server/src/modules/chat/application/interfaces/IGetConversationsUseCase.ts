import { IConversation } from '../../domain/entities/Conversation';

export interface IGetConversationsData {
  userId: string;
  role: 'student' | 'instructor';
}

export interface IGetConversationsUseCase {
  execute(data: IGetConversationsData): Promise<IConversation[]>;
}
