export interface IConversation {
  conversationId?: string;
  studentId: string;
  instructorId: string;
  courseId: string; // Context: which course this chat is about
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
  };
  unreadCount: {
    student: number;
    instructor: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
