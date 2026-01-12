export interface IConversation {
  conversationId: string;
  student: {
    id: string;
    name: string;
    profilePicture?: string;
  } | null;
  instructor: {
    id: string;
    name: string;
    profilePicture?: string;
    jobTitle: string;
    experience: string;
  } | null;
  course: {
    id: string;
    title: string;
    thumbnail?: string;
  } | null;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
  };
  unreadCount?: {
    student: number;
    instructor: number;
  };
  updatedAt: Date;
}

