import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true},
  title: { type: String, required: true },
  description: { type: String, required: true },
  contentType: { type: String, enum: ["video", "pdf"], default:'video' },
  fileName: { type: String, required: true },
  order: Number,
  duration: Number,
  resources: [{ type: String }],
  isFreePreview: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

LessonSchema.index({ moduleId: 1, order: 1 });

export const LessonModel = mongoose.model("Lesson", LessonSchema);
