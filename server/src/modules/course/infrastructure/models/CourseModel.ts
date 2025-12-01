import mongoose from "mongoose";
import { string } from "zod";

const CourseSchema = new mongoose.Schema({
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
  thumbnailUrl: { type: String , default:null },
  title: { type: String, required: true },
  subText: { type: String, required: true },
  category: { type: String , required: true },
  courseLevel:{type:String, enum: [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Beginner - Intermediate",
    "Intermediate - Advanced",
    "All Level",
  ], required:true},
  language:{type:String, default: 'English'},
  price: { type: Number, default: 0  },
  features: [{type:String, required:true}],
  description: { type: String, required: true },
  duration: {type:String, required:true},
  tags: [{type:String, required:true}],
  status: {
  type: String,
  enum: ["draft", "list", "unlist"],
  default: "draft"
}
}, { timestamps: true });

CourseSchema.index({ instructorId: 1 }); 
CourseSchema.index({status: 1, createdAt: -1 }); 


export const CourseModel = mongoose.model("Course", CourseSchema);
