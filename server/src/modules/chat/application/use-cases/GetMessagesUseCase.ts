import { IGetMessagesUseCase } from '../interfaces/IGetMessagesUseCase';
import { IMessageReadRepository } from '../../domain/IRepositories/IMessageRepository';
import { IConversationReadRepository } from '../../domain/IRepositories/IConversationReadRepository';
import { IMessage } from '../../domain/entities/Message';

export class GetMessagesUseCase implements IGetMessagesUseCase {
  constructor(
    private messageReadRepository: IMessageReadRepository,
    private conversationReadRepository: IConversationReadRepository,
  ) {}

  async execute(
    conversationId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<IMessage[]> {
    // Verify user has access to this conversation
    const conversation =
      await this.conversationReadRepository.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (
      conversation.studentId !== userId &&
      conversation.instructorId !== userId
    ) {
      throw new Error('Unauthorized access to conversation');
    }

    // Fetch messages
    const messages = await this.messageReadRepository.findByConversationId(
      conversationId,
      limit,
      offset,
    );

    return messages.map((message) => ({
      ...message,
      id: message.messageId,
    }));
  }
}
