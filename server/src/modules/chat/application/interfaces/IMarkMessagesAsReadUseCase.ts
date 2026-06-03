export interface IMarkMessagesAsReadData {
  conversationId: string;
  userId: string;
  role: 'student' | 'instructor';
}

export interface IMarkMessagesAsReadUseCase {
  execute(data: IMarkMessagesAsReadData): Promise<void>;
}
