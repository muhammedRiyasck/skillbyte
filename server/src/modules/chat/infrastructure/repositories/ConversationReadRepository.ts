import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IConversation } from '../../domain/entities/Conversation';
import { IConversationReadRepository } from '../../domain/IRepositories/IConversationReadRepository';
import {
  ConversationModel,
  IConversationDocument,
} from '../models/ConversationModel';

export class ConversationReadRepository
  extends BaseRepository<IConversation, IConversationDocument>
  implements IConversationReadRepository
{
  constructor() {
    super(ConversationModel);
  }

  toEntity(doc: IConversationDocument): IConversation {
    return doc.toJSON() as IConversation;
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
    role: 'student' | 'instructor',
  ): Promise<IConversation[]> {
    const query =
      role === 'student' ? { studentId: userId } : { instructorId: userId };

    const docs = await ConversationModel.find(query)
      .sort({ updatedAt: -1 })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async getUnreadCount(
    userId: string,
    role: 'student' | 'instructor',
  ): Promise<number> {
    const query =
      role === 'student' ? { studentId: userId } : { instructorId: userId };

    const conversations = await ConversationModel.find(query).exec();

    return conversations.reduce((total, conv) => {
      return (
        total +
        (role === 'student'
          ? conv.unreadCount.student
          : conv.unreadCount.instructor)
      );
    }, 0);
  }
}
