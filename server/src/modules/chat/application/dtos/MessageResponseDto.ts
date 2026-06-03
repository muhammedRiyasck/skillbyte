export interface MessageResponseDto {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  content: string;
  type: string;
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}
