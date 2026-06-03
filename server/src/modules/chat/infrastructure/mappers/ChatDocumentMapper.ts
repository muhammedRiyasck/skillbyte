import { IConversation } from '../../domain/entities/Conversation';
import { IMessage } from '../../domain/entities/Message';
import { IConversationDocument } from '../models/ConversationModel';
import { IMessageDocument } from '../models/MessageModel';

export class ChatDocumentMapper {
  static toConversationEntity(doc: IConversationDocument): IConversation {
    return doc.toJSON() as IConversation;
  }

  static toMessageEntity(doc: IMessageDocument): IMessage {
    return doc.toJSON() as IMessage;
  }
}
