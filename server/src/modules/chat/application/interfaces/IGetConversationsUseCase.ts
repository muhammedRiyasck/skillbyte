import { IConversation } from '../../domain/entities/Conversation';

export interface IGetConversationsUseCase {
  execute(
    userId: string,
    role: 'student' | 'instructor',
  ): Promise<IConversation[]>;
}
