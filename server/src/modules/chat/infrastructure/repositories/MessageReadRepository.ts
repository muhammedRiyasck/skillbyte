import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IMessage } from '../../domain/entities/Message';
import { IMessageReadRepository } from '../../domain/IRepositories/IMessageRepository';
import { MessageModel, IMessageDocument } from '../models/MessageModel';

import { ChatDocumentMapper } from '../mappers/ChatDocumentMapper';

export class MessageReadRepository
  extends BaseRepository<IMessage, IMessageDocument>
  implements IMessageReadRepository
{
  constructor() {
    super(MessageModel);
  }

  toEntity(doc: IMessageDocument): IMessage {
    return ChatDocumentMapper.toMessageEntity(doc);
  }

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
