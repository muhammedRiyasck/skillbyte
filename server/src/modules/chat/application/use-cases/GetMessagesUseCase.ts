import {
  IGetMessagesUseCase,
  IGetMessagesData,
} from '../interfaces/IGetMessagesUseCase';
import { IMessageReadRepository } from '../../domain/IRepositories/IMessageRepository';
import { IConversationReadRepository } from '../../domain/IRepositories/IConversationReadRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { MessageResponseMapper } from '../mappers/MessageResponseMapper';
import { MessageResponseDto } from '../dtos/MessageResponseDto';

/** Executes the business logic for get messages. */
export class GetMessagesUseCase implements IGetMessagesUseCase {
  constructor(
    private messageReadRepository: IMessageReadRepository,
    private conversationReadRepository: IConversationReadRepository,
  ) {}

  /**
   * Execute for the GetMessages entity.
   *
   * @param data - The data information.
   * @returns The standardized HTTP response.
   */
  async execute(data: IGetMessagesData): Promise<MessageResponseDto[]> {
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

    const messages = await this.messageReadRepository.findByConversationId(
      conversationId,
      limit,
      offset,
    );

    return messages.map((msg) => MessageResponseMapper.toDto(msg));
  }
}
