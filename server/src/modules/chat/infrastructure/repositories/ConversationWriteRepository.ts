import { IConversationWriteRepository } from '../../domain/IRepositories/IConversationWriteRepository';
import { IConversation } from '../../domain/entities/Conversation';
import { ConversationModel } from '../models/ConversationModel';
import { UserRole } from '../../../../shared/enums/UserRole';

import { ChatDocumentMapper } from '../mappers/ChatDocumentMapper';

/** Manages database operations for conversation write. */
export class ConversationWriteRepository
  implements IConversationWriteRepository
{
  /**
   * Save for the ConversationWrite entity.
   *
   * @param conversation - The conversation information.
   * @returns The result of the operation.
   */
  async save(conversation: IConversation): Promise<IConversation> {
    const doc = new ConversationModel(conversation);
    const saved = await doc.save();
    return ChatDocumentMapper.toConversationEntity(saved);
  }

  /**
   * Update last message for the ConversationWrite entity.
   *
   * @param conversationId - The unique identifier for the conversation.
   * @param message - The message information.
   */
  async updateLastMessage(
    conversationId: string,
    message: { content: string; senderId: string; timestamp: Date },
  ): Promise<void> {
    await ConversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: message,
      updatedAt: new Date(),
    }).exec();
  }

  /**
   * Increment unread count for the ConversationWrite entity.
   *
   * @param conversationId - The unique identifier for the conversation.
   * @param role - The role information.
   */
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

  /**
   * Reset unread count for the ConversationWrite entity.
   *
   * @param conversationId - The unique identifier for the conversation.
   * @param role - The role information.
   */
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
