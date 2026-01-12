import { IBaseRepository } from "../../../../shared/repositories/IBaseRepository";
import { IConversation } from "../entities/Conversation";

export interface IConversationReadRepository
  extends IBaseRepository<IConversation> {
  findByParticipants(
    studentId: string,
    instructorId: string,
    courseId?: string,
  ): Promise<IConversation | null>;
  findAllByUserId(
    userId: string,
    role: 'student' | 'instructor',
  ): Promise<IConversation[]>;
  getUnreadCount(
    userId: string,
    role: 'student' | 'instructor',
  ): Promise<number>;
}
