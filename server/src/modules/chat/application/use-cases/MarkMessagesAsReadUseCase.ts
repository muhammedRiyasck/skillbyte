import {
  IMarkMessagesAsReadUseCase,
  IMarkMessagesAsReadData,
} from '../interfaces/IMarkMessagesAsReadUseCase';
import { IMessageWriteRepository } from '../../domain/IRepositories/IMessageRepository';
import { IConversationWriteRepository } from '../../domain/IRepositories/IConversationWriteRepository';
import { IChatNotifier } from '../interfaces/IChatNotifier';

/** Executes the business logic for mark messages as read. */
export class MarkMessagesAsReadUseCase implements IMarkMessagesAsReadUseCase {
  constructor(
    private messageWriteRepository: IMessageWriteRepository,
    private conversationWriteRepository: IConversationWriteRepository,
    private chatNotifier: IChatNotifier,
  ) {}

  /**
   * Execute for the MarkMessagesAsRead entity.
   *
   * @param data - The data information.
   */
  async execute(data: IMarkMessagesAsReadData): Promise<void> {
    const { conversationId, userId, role } = data;

    // Mark all messages as read for this user
    await this.messageWriteRepository.markAllAsRead(conversationId, userId);

    // Reset unread count for this user
    await this.conversationWriteRepository.resetUnreadCount(
      conversationId,
      role,
    );

    // Emit read receipt via notifier
    this.chatNotifier.notifyMessagesRead(conversationId, userId);

    // Emit update to the user who read it so their unread count badge updates instantly
    this.chatNotifier.notifyConversationUpdated(userId, conversationId);
  }
}
