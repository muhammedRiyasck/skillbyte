import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IConversation } from '../../domain/entities/Conversation';
import { IConversationReadRepository } from '../../domain/IRepositories/IConversationReadRepository';
import {
  ConversationModel,
  IConversationDocument,
} from '../models/ConversationModel';
import { UserRole } from '../../../../shared/enums/UserRole';

import { ChatDocumentMapper } from '../mappers/ChatDocumentMapper';

/** Manages database operations for conversation read. */
export class ConversationReadRepository
  extends BaseRepository<IConversation, IConversationDocument>
  implements IConversationReadRepository
{
  constructor() {
    super(ConversationModel);
  }

  /**
   * To entity for the ConversationRead entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  toEntity(doc: IConversationDocument): IConversation {
    return ChatDocumentMapper.toConversationEntity(doc);
  }

  /**
   * Find by participants for the ConversationRead entity.
   *
   * @param studentId - The unique identifier for the student.
   * @param instructorId - The unique identifier for the instructor.
   * @param courseId - The unique identifier for the course.
   * @returns The result of the operation.
   */
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

  /**
   * Find all by user id for the ConversationRead entity.
   *
   * @param userId - The unique identifier for the user.
   * @param role - The role information.
   * @returns The result of the operation.
   */
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
}
