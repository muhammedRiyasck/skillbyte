import { Request, Response } from 'express';
import { ICreateConversationUseCase } from '../../application/interfaces/ICreateConversationUseCase';
import { ISendMessageUseCase } from '../../application/interfaces/ISendMessageUseCase';
import { IGetConversationsUseCase } from '../../application/interfaces/IGetConversationsUseCase';
import { IGetMessagesUseCase } from '../../application/interfaces/IGetMessagesUseCase';
import { IMarkMessagesAsReadUseCase } from '../../application/interfaces/IMarkMessagesAsReadUseCase';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { UserRole } from '../../../../shared/enums/UserRole';

type ChatParticipantRole = UserRole.STUDENT | UserRole.INSTRUCTOR;

export class ChatController {
  constructor(
    private createConversationUseCase: ICreateConversationUseCase,
    private sendMessageUseCase: ISendMessageUseCase,
    private getConversationsUseCase: IGetConversationsUseCase,
    private getMessagesUseCase: IGetMessagesUseCase,
    private markMessagesAsReadUseCase: IMarkMessagesAsReadUseCase,
  ) {}

  createConversation = async (req: Request, res: Response): Promise<void> => {
    const authenticatedUser = req as AuthenticatedRequest;
    // Security: studentId is always derived from the authenticated token.
    // The client cannot spoof another user's identity.
    const studentId = authenticatedUser.user.id;
    const { instructorId, courseId } = req.body;

    const conversation = await this.createConversationUseCase.execute({
      studentId,
      instructorId,
      courseId,
    });

    ApiResponseHelper.created(res, 'Conversation created', conversation);
  };

  getConversations = async (req: Request, res: Response): Promise<void> => {
    const authenticatedUser = req as AuthenticatedRequest;
    const userId = authenticatedUser.user.id;
    const role = this.getChatParticipantRole(authenticatedUser.user.role);

    if (!userId) {
      ApiResponseHelper.unauthorized(res, 'Unauthorized');
      return;
    }

    const conversations = await this.getConversationsUseCase.execute({
      userId,
      role,
    });

    ApiResponseHelper.success(res, 'Conversations fetched', conversations);
  };

  sendMessage = async (req: Request, res: Response): Promise<void> => {
    const { conversationId } = req.params;
    const { content, type, fileUrl, fileName } = req.body;
    const authenticatedUser = req as AuthenticatedRequest;
    const senderId = authenticatedUser.user.id;
    const senderRole = this.getChatParticipantRole(authenticatedUser.user.role);

    if (!senderId) {
      ApiResponseHelper.unauthorized(res, 'Unauthorized');
      return;
    }

    const message = await this.sendMessageUseCase.execute({
      conversationId,
      senderId,
      senderRole,
      content,
      type: type || 'text',
      fileUrl,
      fileName,
    });

    ApiResponseHelper.created(res, 'Message sent', message);
  };

  getMessages = async (req: Request, res: Response): Promise<void> => {
    const { conversationId } = req.params;
    const authenticatedUser = req as AuthenticatedRequest;
    const userId = authenticatedUser.user.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      ApiResponseHelper.unauthorized(res, 'Unauthorized');
      return;
    }

    const messages = await this.getMessagesUseCase.execute({
      conversationId,
      userId,
      limit,
      offset,
    });

    ApiResponseHelper.success(res, 'Messages fetched', messages);
  };

  markAsRead = async (req: Request, res: Response): Promise<void> => {
    const { conversationId } = req.params;
    const authenticatedUser = req as AuthenticatedRequest;
    const userId = authenticatedUser.user.id;
    const role = this.getChatParticipantRole(authenticatedUser.user.role);

    if (!userId) {
      ApiResponseHelper.unauthorized(res, 'Unauthorized');
      return;
    }

    await this.markMessagesAsReadUseCase.execute({
      conversationId,
      userId,
      role,
    });

    ApiResponseHelper.success(res, 'Messages marked as read');
  };

  private getChatParticipantRole(role: string): ChatParticipantRole {
    if (role === UserRole.STUDENT || role === UserRole.INSTRUCTOR) {
      return role;
    }

    throw new HttpError(
      'Only students and instructors can use chat',
      HttpStatusCode.FORBIDDEN,
    );
  }
}
