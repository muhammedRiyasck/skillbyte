import { Request, Response } from 'express';
import { ICreateConversationUseCase } from '../../application/interfaces/ICreateConversationUseCase';
import { ISendMessageUseCase } from '../../application/interfaces/ISendMessageUseCase';
import { IGetConversationsUseCase } from '../../application/interfaces/IGetConversationsUseCase';
import { IGetMessagesUseCase } from '../../application/interfaces/IGetMessagesUseCase';
import { IMarkMessagesAsReadUseCase } from '../../application/interfaces/IMarkMessagesAsReadUseCase';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';

export class ChatController {
  constructor(
    private createConversationUseCase: ICreateConversationUseCase,
    private sendMessageUseCase: ISendMessageUseCase,
    private getConversationsUseCase: IGetConversationsUseCase,
    private getMessagesUseCase: IGetMessagesUseCase,
    private markMessagesAsReadUseCase: IMarkMessagesAsReadUseCase,
  ) {}

  createConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId, instructorId, courseId } = req.body;

      const conversation = await this.createConversationUseCase.execute({
        studentId,
        instructorId,
        courseId,
      });

      ApiResponseHelper.created(res, 'Conversation created', conversation);
    } catch (error) {
      ApiResponseHelper.badRequest(
        res,
        'Failed to create conversation',
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  getConversations = async (req: Request, res: Response): Promise<void> => {
    try {
      const authenticatedUser = req as AuthenticatedRequest;
      const userId = authenticatedUser.user.id;
      const role = authenticatedUser.user.role as 'student' | 'instructor';

      if (!userId || !role) {
        ApiResponseHelper.unauthorized(res, 'Unauthorized');
        return;
      }

      const conversations = await this.getConversationsUseCase.execute(
        userId,
        role,
      );

      ApiResponseHelper.success(res, 'Conversations fetched', conversations);
    } catch (error) {
      ApiResponseHelper.error(
        res,
        'Failed to fetch conversations',
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { conversationId, content, type, fileUrl, fileName } = req.body;
      const authenticatedUser = req as AuthenticatedRequest;
      const senderId = authenticatedUser.user.id;
      const senderRole = authenticatedUser.user.role as
        | 'student'
        | 'instructor';

      if (!senderId || !senderRole) {
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
    } catch (error) {
      ApiResponseHelper.badRequest(
        res,
        'Failed to send message',
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const authenticatedUser = req as AuthenticatedRequest;
      const userId = authenticatedUser.user.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!userId) {
        ApiResponseHelper.unauthorized(res, 'Unauthorized');
        return;
      }

      const messages = await this.getMessagesUseCase.execute(
        conversationId,
        userId,
        limit,
        offset,
      );
      ApiResponseHelper.success(res, 'Messages fetched', messages);
    } catch (error) {
      ApiResponseHelper.badRequest(
        res,
        'Failed to fetch messages',
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const authenticatedUser = req as AuthenticatedRequest;
      const userId = authenticatedUser.user.id;
      const role = authenticatedUser.user.role as 'student' | 'instructor';

      if (!userId || !role) {
        ApiResponseHelper.unauthorized(res, 'Unauthorized');
        return;
      }

      await this.markMessagesAsReadUseCase.execute(
        conversationId,
        userId,
        role,
      );

      ApiResponseHelper.success(res, 'Messages marked as read');
    } catch (error) {
      ApiResponseHelper.badRequest(
        res,
        'Failed to mark messages as read',
        error instanceof Error ? error.message : undefined,
      );
    }
  };
}
