import { IMessageWriteRepository } from '../../domain/IRepositories/IMessageRepository';
import { IMessage } from '../../domain/entities/Message';
import { MessageModel } from '../models/MessageModel';

export class MessageWriteRepository implements IMessageWriteRepository {
  async save(message: IMessage): Promise<IMessage> {
    const doc = new MessageModel(message);
    const saved = await doc.save();
    return saved.toJSON();
  }

  async markAsRead(messageId: string): Promise<void> {
    await MessageModel.findByIdAndUpdate(messageId, {
      isRead: true,
      readAt: new Date(),
    }).exec();
  }

  async markAllAsRead(conversationId: string, userId: string): Promise<void> {
    await MessageModel.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    ).exec();
  }
}
