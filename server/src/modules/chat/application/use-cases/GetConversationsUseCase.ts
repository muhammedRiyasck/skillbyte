import {
  IGetConversationsUseCase,
  IGetConversationsData,
} from '../interfaces/IGetConversationsUseCase';
import { IConversationReadRepository } from '../../domain/IRepositories/IConversationReadRepository';
import { ConversationResponseMapper } from '../mappers/ConversationResponseMapper';
import { ConversationResponseDto } from '../dtos/ConversationResponseDto';
import { IConversationPopulationService } from '../services/ConversationPopulationService';

/** Executes the business logic for get conversations. */
export class GetConversationsUseCase implements IGetConversationsUseCase {
  constructor(
    private conversationReadRepository: IConversationReadRepository,
    private populationService: IConversationPopulationService,
  ) {}

  /**
   * Execute for the GetConversations entity.
   *
   * @param data - The data information.
   * @returns The standardized HTTP response.
   */
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
