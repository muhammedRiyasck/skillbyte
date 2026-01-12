import { IMessage } from '../../domain/entities/Message';

export interface ISendMessageData {
  conversationId: string;
  senderId: string;
  senderRole: 'student' | 'instructor';
  content: string;
  type: 'text' | 'image' | 'document';
  fileUrl?: string;
  fileName?: string;
}

export interface ISendMessageUseCase {
  execute(data: ISendMessageData): Promise<IMessage>;
}
