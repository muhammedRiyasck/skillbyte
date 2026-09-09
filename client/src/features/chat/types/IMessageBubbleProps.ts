import type { IMessage } from './IMessage';

export interface MessageBubbleProps {
  message: Pick<
    IMessage,
    'messageId' | 'content' | 'senderRole' | 'type' | 'fileUrl' | 'fileName' | 'createdAt' | 'isRead'
  >;
  isOwnMessage: boolean;
}

