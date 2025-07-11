import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnailUrl: { type: String , required: true },
  price: { type: Number, default: 0  },
  category: { type: String , required: true },
  tags: [{ type: String }],
  status: {
  type: String,
  enum: ["draft", "published", "unpublished"],
  default: "draft"
}

}, { timestamps: true });

export const CourseModel = mongoose.model("Course", CourseSchema);
