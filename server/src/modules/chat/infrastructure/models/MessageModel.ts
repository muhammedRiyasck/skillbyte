import mongoose, { Schema, Document } from 'mongoose';
import { IMessage } from '../../domain/entities/Message';

export interface IMessageDocument extends IMessage, Document {
  _id: mongoose.Types.ObjectId;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['student', 'instructor'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'document'],
      default: 'text',
    },
    fileUrl: String,
    fileName: String,
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        ret.id = ret._id.toString();
        ret.messageId = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Compound index for fetching messages in a conversation
MessageSchema.index({ conversationId: 1, createdAt: -1 });

// Index for counting unread messages
MessageSchema.index({ conversationId: 1, isRead: 1 });

export const MessageModel = mongoose.model<IMessageDocument>(
  'Message',
  MessageSchema,
);
