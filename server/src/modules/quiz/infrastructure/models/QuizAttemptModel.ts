import mongoose, { Document, Schema, Types } from 'mongoose';
import { QuizStatus } from '../../../../shared/enums/QuizStatus';
import { IQuizAttempt } from '../../domain/entities/QuizAttempt';
import { QuizDifficulty } from '../../../../shared/enums/QuizDifficulty';

export interface IQuizAttemptDoc
  extends Omit<IQuizAttempt, 'attemptId' | 'configId' | 'courseId' | 'userId'>,
    Document {
  configId: Types.ObjectId;
  courseId: Types.ObjectId;
  userId: Types.ObjectId;
}

const QuizQuestionSchema = new Schema(
  {
    questionId: { type: String, required: true },
    type: {
      type: String,
      enum: ['mcq', 'true_false', 'short_answer', 'essay'],
      required: true,
    },
    questionText: { type: String, required: true },
    topicTag: { type: String, required: true },
    difficulty: {
      type: String,
      enum: Object.values(QuizDifficulty),
      required: true,
    },
    explanation: { type: String, required: true },
    // MCQ
    options: { type: [String] },
    correctOptionIndex: { type: Number },
    // True/False
    correctAnswer: { type: Boolean },
    // Phase 2
    modelAnswer: { type: String },
    rubric: { type: String },
    maxWords: { type: Number },
  },
  { _id: false },
);

const StudentAnswerSchema = new Schema(
  {
    questionId: { type: String, required: true },
    type: {
      type: String,
      enum: ['mcq', 'true_false', 'short_answer', 'essay'],
      required: true,
    },
    // MCQ
    selectedOptionIndex: { type: Number },
    // True/False
    selectedAnswer: { type: Boolean },
    // Phase 2
    writtenText: { type: String },
  },
  { _id: false },
);

const PerQuestionResultSchema = new Schema(
  {
    questionId: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    scoreAwarded: { type: Number },
  },
  { _id: false },
);

const QuizAttemptSchema = new Schema(
  {
    configId: {
      type: Schema.Types.ObjectId,
      ref: 'QuizConfig',
      required: true,
    },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    attemptNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(QuizStatus),
      default: QuizStatus.IN_PROGRESS,
    },
    questions: { type: [QuizQuestionSchema], required: true },
    answers: { type: [StudentAnswerSchema], default: [] },
    perQuestionResult: { type: [PerQuestionResultSchema], default: [] },
    score: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    aiFeedback: { type: String, default: '' },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
  },
  { timestamps: true },
);

QuizAttemptSchema.index({ userId: 1, courseId: 1 });
QuizAttemptSchema.index({ courseId: 1 });

export const QuizAttemptModel = mongoose.model<IQuizAttemptDoc>(
  'QuizAttempt',
  QuizAttemptSchema,
);
