import {
  IGetConversationsUseCase,
  IGetConversationsData,
} from '../interfaces/IGetConversationsUseCase';
import { IConversationReadRepository } from '../../domain/IRepositories/IConversationReadRepository';
import { ConversationResponseMapper } from '../mappers/ConversationResponseMapper';
import { ConversationResponseDto } from '../dtos/ConversationResponseDto';
import { IConversationPopulationService } from '../services/ConversationPopulationService';

export class GetConversationsUseCase implements IGetConversationsUseCase {
  constructor(
    private conversationReadRepository: IConversationReadRepository,
    private populationService: IConversationPopulationService,
  ) {}

  async execute(
    data: IGetConversationsData,
  ): Promise<ConversationResponseDto[]> {
    const { userId, role } = data;
    const conversations = await this.conversationReadRepository.findAllByUserId(
      userId,
      role,
    );

    const populatedConversations =
      await this.populationService.populateMany(conversations);
    return populatedConversations.map((c) =>
      ConversationResponseMapper.toDto(c),
    );
  }
}
