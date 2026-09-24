import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IMessage } from '../../domain/entities/Message';
import { IMessageReadRepository } from '../../domain/IRepositories/IMessageRepository';
import { MessageModel, IMessageDocument } from '../models/MessageModel';

import { ChatDocumentMapper } from '../mappers/ChatDocumentMapper';

/** Manages database operations for message read. */
export class MessageReadRepository
  extends BaseRepository<IMessage, IMessageDocument>
  implements IMessageReadRepository
{
  constructor() {
    super(MessageModel);
  }

  /**
   * To entity for the MessageRead entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  toEntity(doc: IMessageDocument): IMessage {
    return ChatDocumentMapper.toMessageEntity(doc);
  }

  /**
   * Find by conversation id for the MessageRead entity.
   *
   * @param conversationId - The unique identifier for the conversation.
   * @param limit - The limit information.
   * @param offset - The offset information.
   * @returns The result of the operation.
   */
  async findByConversationId(
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<IMessage[]> {
    const docs = await MessageModel.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return docs.map((doc) => this.toEntity(doc)).reverse();
  }
}
