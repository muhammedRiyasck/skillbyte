import {
  ICreateConversationUseCase,
  ICreateConversationData,
} from '../interfaces/ICreateConversationUseCase';
import { IConversationWriteRepository } from '../../domain/IRepositories/IConversationWriteRepository';
import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import { IConversation } from '../../domain/entities/Conversation';
import { IConversationReadRepository } from '../../domain/IRepositories/IConversationReadRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { IChatNotifier } from '../interfaces/IChatNotifier';
import { ConversationResponseMapper } from '../mappers/ConversationResponseMapper';
import { ConversationResponseDto } from '../dtos/ConversationResponseDto';
import { IConversationPopulationService } from '../services/ConversationPopulationService';

/** Executes the business logic for create conversation. */
export class CreateConversationUseCase implements ICreateConversationUseCase {
  constructor(
    private conversationReadRepository: IConversationReadRepository,
    private conversationWriteRepository: IConversationWriteRepository,
    private enrollmentReadRepository: IEnrollmentReadRepository,
    private chatNotifier: IChatNotifier,
    private populationService: IConversationPopulationService,
  ) {}

  /**
   * Execute for the CreateConversation entity.
   *
   * @param data - The data information.
   * @returns The standardized HTTP response.
   */
  async execute(
    data: ICreateConversationData,
  ): Promise<ConversationResponseDto> {
    const { studentId, instructorId, courseId } = data;

    // Verify student is enrolled in the course
    const enrollment = await this.enrollmentReadRepository.findEnrollment(
      studentId,
      courseId,
    );
    if (
      !enrollment ||
      enrollment.status == 'pending' ||
      enrollment.status == 'failed' ||
      enrollment.status == 'refunded' ||
      enrollment.status == 'cancelled'
    ) {
      throw new HttpError(
        'Student must be enrolled in the course to start a conversation',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const existingConversation =
      await this.conversationReadRepository.findByParticipants(
        studentId,
        instructorId,
      );

    if (existingConversation) {
      const populatedConversation =
        await this.populationService.populateOne(existingConversation);
      return ConversationResponseMapper.toDto(populatedConversation);
    }

    const newConversation: IConversation = {
      studentId,
      instructorId,
      courseId,
      unreadCount: {
        student: 0,
        instructor: 0,
      },
    };

    const saved = await this.conversationWriteRepository.save(newConversation);

    // Emit update to both participants via notifier
    this.chatNotifier.notifyConversationUpdated(
      studentId,
      saved.conversationId!,
    );
    this.chatNotifier.notifyConversationUpdated(
      instructorId,
      saved.conversationId!,
    );

    const populatedConversation =
      await this.populationService.populateOne(saved);
    return ConversationResponseMapper.toDto(populatedConversation);
  }
}
