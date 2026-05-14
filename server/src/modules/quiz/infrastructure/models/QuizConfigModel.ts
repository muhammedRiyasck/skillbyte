import mongoose, { Document, Schema, Types } from 'mongoose';
import { QuizDifficulty } from '../../../../shared/enums/QuizDifficulty';
import { IQuizConfig } from '../../domain/entities/QuizConfig';

export interface IQuizConfigDoc
  extends Omit<IQuizConfig, 'configId' | 'courseId' | 'instructorId'>,
    Document {
  courseId: Types.ObjectId;
  instructorId: Types.ObjectId;
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

const QuizConfigSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      unique: true,
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'Instructor',
      required: true,
    },
    isEnabled: { type: Boolean, default: false },
    topics: { type: [String], required: true },
    questionCount: { type: Number, default: 10, min: 5, max: 50 },
    questionTypes: [
      {
        type: String,
        enum: ['mcq', 'true_false', 'short_answer', 'essay'],
        required: true,
      },
    ],
    difficulty: {
      type: String,
      enum: Object.values(QuizDifficulty),
      default: QuizDifficulty.MIXED,
    },
    passPercentage: { type: Number, default: 60, min: 0, max: 100 },
    maxAttempts: { type: Number, default: 1, min: 1, max: 5 },
    timeLimit: { type: Number, default: null }, // in minutes
    cachedQuestions: { type: [QuizQuestionSchema], default: null },
    questionsGeneratedAt: { type: Date, default: null },
    isPoolGenerationPending: { type: Boolean, default: false },
  },
  { timestamps: true },
);

QuizConfigSchema.index({ courseId: 1 });
QuizConfigSchema.index({ instructorId: 1 });

export const QuizConfigModel = mongoose.model<IQuizConfigDoc>(
  'QuizConfig',
  QuizConfigSchema,
);
