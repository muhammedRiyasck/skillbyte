import {
  IGetMessagesUseCase,
  IGetMessagesData,
} from '../interfaces/IGetMessagesUseCase';
import { IMessageReadRepository } from '../../domain/IRepositories/IMessageRepository';
import { IConversationReadRepository } from '../../domain/IRepositories/IConversationReadRepository';
import { IMessage } from '../../domain/entities/Message';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class GetMessagesUseCase implements IGetMessagesUseCase {
  constructor(
    private messageReadRepository: IMessageReadRepository,
    private conversationReadRepository: IConversationReadRepository,
  ) {}

  async execute(data: IGetMessagesData): Promise<IMessage[]> {
    const { conversationId, userId, limit = 50, offset = 0 } = data;
    // Verify user has access to this conversation
    const conversation =
      await this.conversationReadRepository.findById(conversationId);

    if (!conversation) {
      throw new HttpError('Conversation not found', HttpStatusCode.NOT_FOUND);
    }

    if (
      conversation.studentId !== userId &&
      conversation.instructorId !== userId
    ) {
      throw new HttpError(
        'Unauthorized access to conversation',
        HttpStatusCode.FORBIDDEN,
      );
    }

    // Fetch messages
    const messages = await this.messageReadRepository.findByConversationId(
      conversationId,
      limit,
      offset,
    );

    return messages;
  }
}
