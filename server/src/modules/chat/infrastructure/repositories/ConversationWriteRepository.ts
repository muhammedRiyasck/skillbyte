import { IConversationWriteRepository } from '../../domain/IRepositories/IConversationWriteRepository';
import { IConversation } from '../../domain/entities/Conversation';
import { ConversationModel } from '../models/ConversationModel';
import { UserRole } from '../../../../shared/enums/UserRole';

import { ChatDocumentMapper } from '../mappers/ChatDocumentMapper';

export class ConversationWriteRepository
  implements IConversationWriteRepository
{
  async save(conversation: IConversation): Promise<IConversation> {
    const doc = new ConversationModel(conversation);
    const saved = await doc.save();
    return ChatDocumentMapper.toConversationEntity(saved);
  }

  async updateLastMessage(
    conversationId: string,
    message: { content: string; senderId: string; timestamp: Date },
  ): Promise<void> {
    await ConversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: message,
      updatedAt: new Date(),
    }).exec();
  }

  async incrementUnreadCount(
    conversationId: string,
    role: UserRole.STUDENT | UserRole.INSTRUCTOR,
  ): Promise<void> {
    const field =
      role === UserRole.STUDENT
        ? 'unreadCount.student'
        : 'unreadCount.instructor';

    await ConversationModel.findByIdAndUpdate(conversationId, {
      $inc: { [field]: 1 },
    }).exec();
  }

  async resetUnreadCount(
    conversationId: string,
    role: UserRole.STUDENT | UserRole.INSTRUCTOR,
  ): Promise<void> {
    const field =
      role === UserRole.STUDENT
        ? 'unreadCount.student'
        : 'unreadCount.instructor';

    await ConversationModel.findByIdAndUpdate(conversationId, {
      $set: { [field]: 0 },
    }).exec();
  }
}
