import { IConversation } from '../../domain/entities/Conversation';
import { ConversationResponseDto } from '../dtos/ConversationResponseDto';

/** Handles conversation response mapper functionality. */
export class ConversationResponseMapper {
  /**
   * To dto for the ConversationResponseMapper entity.
   *
   * @param conversation - The conversation information.
   * @returns The standardized HTTP response.
   */
  static toDto(conversation: IConversation): ConversationResponseDto {
    return {
      conversationId: conversation.conversationId!,
      studentId: conversation.studentId,
      instructorId: conversation.instructorId,
      courseId: conversation.courseId,
      lastMessage: conversation.lastMessage,
      unreadCount: conversation.unreadCount,
      student: conversation.student,
      instructor: conversation.instructor,
      course: conversation.course,
      createdAt: conversation.createdAt!,
      updatedAt: conversation.updatedAt!,
    };
  }
}
