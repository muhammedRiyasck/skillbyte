import mongoose, { Schema, Document } from 'mongoose';
import { INotification } from '../../domain/entities/Notification';

export interface INotificationDocument extends INotification, Document {}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const NotificationModel = mongoose.model<INotificationDocument>(
  'Notification',
  NotificationSchema,
);
