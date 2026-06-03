export interface ConversationResponseDto {
  conversationId: string;
  studentId: string;
  instructorId: string;
  courseId: string;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
  };
  unreadCount: {
    student: number;
    instructor: number;
  };
  student?: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  } | null;
  instructor?: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    jobTitle: string;
    experience: string;
  } | null;
  course?: {
    id: string;
    title: string;
    thumbnail?: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
