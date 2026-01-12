import mongoose, { Schema, Document } from 'mongoose';
import { IConversation } from '../../domain/entities/Conversation';

export interface IConversationDocument extends IConversation, Document {
  _id: mongoose.Types.ObjectId;
}

const ConversationSchema = new Schema<IConversationDocument>(
  {
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    instructorId: {
      type: String,
      required: true,
      index: true,
    },
    courseId: {
      type: String,
      required: true,
      index: true,
    },
    lastMessage: {
      content: String,
      senderId: String,
      timestamp: Date,
    },
    unreadCount: {
      student: {
        type: Number,
        default: 0,
      },
      instructor: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        ret.conversationId = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Compound unique index to ensure one conversation per student-instructor combination
ConversationSchema.index({ studentId: 1, instructorId: 1 }, { unique: true });

// Index for sorting by recent activity
ConversationSchema.index({ updatedAt: -1 });

export const ConversationModel = mongoose.model<IConversationDocument>(
  'Conversation',
  ConversationSchema,
);
