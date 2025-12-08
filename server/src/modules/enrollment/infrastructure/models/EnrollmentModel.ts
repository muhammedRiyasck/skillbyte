import mongoose, { Schema, Document } from "mongoose";

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  status: "pending" | "completed" | "failed" | "refunded";
  enrolledAt: Date;
  completedAt?: Date;
  progress: number;
}

const EnrollmentSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    progress: { type: Number, default: 0 }, // Percentage 0-100
  },
  { timestamps: true }
);

// Compound index to prevent double enrollment
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const EnrollmentModel = mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);
