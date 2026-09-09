import { Router } from 'express';
import {
  chatController,
  chatUploadController,
} from '../dependencyInjection/ChatDependencyContainer';
import { chatUploadMiddleware } from '../middlewares/ChatUploadMiddleware';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import asyncHandler from '../../../../shared/utils/AsyncHandler';
import { validateRequest } from '../../../../shared/middlewares/validateRequest';
import {
  CreateConversationSchema,
  SendMessageSchema,
} from '../validations/ChatValidation';

const router = Router();

// Create or get conversation
router.post(
  '/conversations',
  authenticate,
  requireRole('student'),
  validateRequest(CreateConversationSchema),
  asyncHandler(chatController.createConversation),
);

// Get all conversations for current user
router.get(
  '/conversations',
  authenticate,
  requireRole('student', 'instructor'),
  asyncHandler(chatController.getConversations),
);

// Send a message
router.post(
  '/conversations/:conversationId/messages',
  authenticate,
  requireRole('student', 'instructor'),
  validateRequest(SendMessageSchema),
  asyncHandler(chatController.sendMessage),
);

// Get messages for a conversation
router.get(
  '/conversations/:conversationId/messages',
  authenticate,
  requireRole('student', 'instructor'),
  asyncHandler(chatController.getMessages),
);

// Mark messages as read
router.patch(
  '/conversations/:conversationId/read',
  authenticate,
  requireRole('student', 'instructor'),
  asyncHandler(chatController.markAsRead),
);

// Upload a file/image for chat (returns Cloudinary URL + type)
router.post(
  '/upload',
  authenticate,
  requireRole('student', 'instructor'),
  chatUploadMiddleware.single('file'),
  asyncHandler(chatUploadController.uploadFile),
);

export default router;
