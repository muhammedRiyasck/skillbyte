import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true,unique:true },
  title: { type: String, required: true },
  contentType: { type: String, enum: ["video", "pdf"], required: true },
  contentUrl: { type: String, required: true },
  order: { type: Number, required: true },
  isFreePreview: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export const LessonModel = mongoose.model("Lesson", LessonSchema);
