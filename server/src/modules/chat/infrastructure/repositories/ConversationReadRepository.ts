import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IConversation } from '../../domain/entities/Conversation';
import { IConversationReadRepository } from '../../domain/IRepositories/IConversationReadRepository';
import {
  ConversationModel,
  IConversationDocument,
} from '../models/ConversationModel';
import { UserRole } from '../../../../shared/enums/UserRole';

import { ChatMapper } from '../mappers/ChatMapper';

export class ConversationReadRepository
  extends BaseRepository<IConversation, IConversationDocument>
  implements IConversationReadRepository
{
  constructor() {
    super(ConversationModel);
  }

  toEntity(doc: IConversationDocument): IConversation {
    return ChatMapper.toConversationEntity(doc);
  }

  async findByParticipants(
    studentId: string,
    instructorId: string,
    courseId?: string,
  ): Promise<IConversation | null> {
    const query: {
      studentId: string;
      instructorId: string;
      courseId?: string;
    } = { studentId, instructorId };
    if (courseId) {
      query.courseId = courseId;
    }
    const doc = await ConversationModel.findOne(query).exec();

    return doc ? this.toEntity(doc) : null;
  }

  async findAllByUserId(
    userId: string,
    role: UserRole.STUDENT | UserRole.INSTRUCTOR,
  ): Promise<IConversation[]> {
    const query =
      role === UserRole.STUDENT
        ? { studentId: userId }
        : { instructorId: userId };

    const docs = await ConversationModel.find(query)
      .sort({ updatedAt: -1 })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async getUnreadCount(
    userId: string,
    role: UserRole.STUDENT | UserRole.INSTRUCTOR,
  ): Promise<number> {
    const query =
      role === UserRole.STUDENT
        ? { studentId: userId }
        : { instructorId: userId };

    const conversations = await ConversationModel.find(query).exec();

    return conversations.reduce((total, conv) => {
      return (
        total +
        (role === UserRole.STUDENT
          ? conv.unreadCount.student
          : conv.unreadCount.instructor)
      );
    }, 0);
  }
}
