export interface IMarkMessagesAsReadUseCase {
  execute(
    conversationId: string,
    userId: string,
    role: 'student' | 'instructor',
  ): Promise<void>;
}
