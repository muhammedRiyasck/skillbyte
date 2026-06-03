import { IConversation } from '../../domain/entities/Conversation';
import { IMessage } from '../../domain/entities/Message';

export interface MessageResponseDto {
  messageId?: string;
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

export interface ConversationResponseDto {
  conversationId?: string;
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

export class ChatMapper {
  static toMessageResponseDto(message: IMessage): MessageResponseDto {
    return {
      messageId: message.messageId,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      content: message.content,
      type: message.type,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      isRead: message.isRead,
      readAt: message.readAt,
      createdAt: message.createdAt,
    };
  }

  static toConversationResponseDto(
    conversation: IConversation,
  ): ConversationResponseDto {
    return {
      conversationId: conversation.conversationId,
      studentId: conversation.studentId,
      instructorId: conversation.instructorId,
      courseId: conversation.courseId,
      lastMessage: conversation.lastMessage,
      unreadCount: conversation.unreadCount,
      student: conversation.student,
      instructor: conversation.instructor,
      course: conversation.course,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }
}
