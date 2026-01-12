import { IConversationWriteRepository } from '../../domain/IRepositories/IConversationWriteRepository.ts';
import { IConversation } from '../../domain/entities/Conversation';
import { ConversationModel } from '../models/ConversationModel';

export class ConversationWriteRepository
  implements IConversationWriteRepository
{
  async save(conversation: IConversation): Promise<IConversation> {
    const doc = new ConversationModel(conversation);
    const saved = await doc.save();
    return saved.toJSON();
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
    role: 'student' | 'instructor',
  ): Promise<void> {
    const field =
      role === 'student' ? 'unreadCount.student' : 'unreadCount.instructor';

    await ConversationModel.findByIdAndUpdate(conversationId, {
      $inc: { [field]: 1 },
    }).exec();
  }

  async resetUnreadCount(
    conversationId: string,
    role: 'student' | 'instructor',
  ): Promise<void> {
    const field =
      role === 'student' ? 'unreadCount.student' : 'unreadCount.instructor';

    await ConversationModel.findByIdAndUpdate(conversationId, {
      $set: { [field]: 0 },
    }).exec();
  }
}
