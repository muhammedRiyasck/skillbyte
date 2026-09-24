import { IConversation } from '../../domain/entities/Conversation';
import { IMessage } from '../../domain/entities/Message';
import { IConversationDocument } from '../models/ConversationModel';
import { IMessageDocument } from '../models/MessageModel';

/** Handles chat document mapper functionality. */
export class ChatDocumentMapper {
  /**
   * To conversation entity for the ChatDocumentMapper entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  static toConversationEntity(doc: IConversationDocument): IConversation {
    return doc.toJSON() as IConversation;
  }

  /**
   * To message entity for the ChatDocumentMapper entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  static toMessageEntity(doc: IMessageDocument): IMessage {
    return doc.toJSON() as IMessage;
  }
}
