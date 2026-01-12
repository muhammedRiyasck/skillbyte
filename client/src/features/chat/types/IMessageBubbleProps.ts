export interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    senderRole: 'student' | 'instructor';
    type: 'text' | 'image' | 'document';
    fileUrl?: string | undefined;
    fileName?: string | undefined;
    createdAt: Date;
    isRead: boolean;
  };
  isOwnMessage: boolean;
}
