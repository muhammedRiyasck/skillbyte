import { Router } from 'express';
import { chatController } from '../dependencyInjection/ChatDependencyContainer';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import asyncHandler from '../../../../shared/utils/AsyncHandler';

const router = Router();

// Create or get conversation
router.post(
  '/conversations',
  authenticate,
  requireRole('student', 'instructor'),
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
  '/messages',
  authenticate,
  requireRole('student', 'instructor'),
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

export default router;
