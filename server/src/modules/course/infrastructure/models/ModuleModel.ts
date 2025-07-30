import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  description: {type:String, required: true },
  order: {type:Number, required: true },
}, { timestamps: true });

export const ModuleModel = mongoose.model("Module", ModuleSchema);
