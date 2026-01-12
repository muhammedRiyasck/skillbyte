import { IConversation } from '../../domain/entities/Conversation';

export interface ICreateConversationData {
  studentId: string;
  instructorId: string;
  courseId: string;
}

export interface ICreateConversationUseCase {
  execute(data: ICreateConversationData): Promise<IConversation>;
}
