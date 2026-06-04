import { z } from 'zod';

/**
 * Schema for POST /conversations
 * The authenticated user's own ID is pulled from the token server-side.
 * Only the OTHER participant's ID and the course context are accepted from the body.
 */
export const CreateConversationSchema = z.object({
  instructorId: z.string().min(1, 'Instructor ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
});

/**
 * Schema for POST /conversations/:conversationId/messages
 */
export const SendMessageSchema = z
  .object({
    content: z.string().optional(),
    type: z.enum(['text', 'image', 'document']).default('text'),
    fileUrl: z.string().url('Invalid file URL').optional(),
    fileName: z.string().optional(),
  })
  .refine(
    (data) =>
      data.type === 'text'
        ? !!data.content && data.content.trim().length > 0
        : !!data.fileUrl,
    {
      message:
        'Text messages require non-empty content; file messages require a fileUrl',
    },
  );

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
