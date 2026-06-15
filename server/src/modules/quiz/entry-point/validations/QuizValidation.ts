import { z } from 'zod';
import { QuizDifficulty } from '../../../../shared/enums/QuizDifficulty';

export const QuizConfigSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  isEnabled: z.boolean().default(true),
  topics: z.array(z.string()).min(1, 'At least one topic is required'),
  questionCount: z.number().int().positive('Question count must be positive'),
  questionTypes: z
    .array(z.enum(['mcq', 'true_false', 'short_answer', 'essay']))
    .min(1, 'At least one question type is required'),
  difficulty: z.nativeEnum(QuizDifficulty),
  passPercentage: z.number().min(0).max(100, 'Must be between 0 and 100'),
  maxAttempts: z.number().int().positive('Max attempts must be positive'),
  timeLimit: z.number().int().positive().nullable(),
});

export type QuizConfigValidationType = z.infer<typeof QuizConfigSchema>;

export const UpdateQuizConfigSchema = QuizConfigSchema.omit({
  courseId: true,
}).partial();

export type UpdateQuizConfigValidationType = z.infer<
  typeof UpdateQuizConfigSchema
>;

const BaseAnswerSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  type: z.enum(['mcq', 'true_false', 'short_answer', 'essay']),
});

const MCQAnswerSchema = BaseAnswerSchema.extend({
  type: z.literal('mcq'),
  selectedOptionIndex: z.number().int().nonnegative(),
});

const TrueFalseAnswerSchema = BaseAnswerSchema.extend({
  type: z.literal('true_false'),
  selectedAnswer: z.boolean(),
});

const ShortAnswerSchema = BaseAnswerSchema.extend({
  type: z.literal('short_answer'),
  writtenText: z.string(),
});

const EssayAnswerSchema = BaseAnswerSchema.extend({
  type: z.literal('essay'),
  writtenText: z.string(),
});

const StudentAnswerSchema = z.discriminatedUnion('type', [
  MCQAnswerSchema,
  TrueFalseAnswerSchema,
  ShortAnswerSchema,
  EssayAnswerSchema,
]);

export const SubmitQuizAttemptSchema = z.object({
  answers: z.array(StudentAnswerSchema),
});

export type SubmitQuizAttemptValidationType = z.infer<
  typeof SubmitQuizAttemptSchema
>;
