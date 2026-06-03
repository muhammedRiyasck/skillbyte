import { ConversationResponseDto } from '../dtos/ConversationResponseDto';

export interface ICreateConversationData {
  studentId: string;
  instructorId: string;
  courseId: string;
}

export interface ICreateConversationUseCase {
  execute(data: ICreateConversationData): Promise<ConversationResponseDto>;
}
