import mongoose from "mongoose";

const InstructorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  subject:{type:String , required:true},
  jobTitle:{type:String, required:true},
  experience:{type:Number , required:true},
  socialProfile:{ type: String, required:true },
  portfolio:{type:String,default:null},
  bio: { type: String,default: null },
  phoneNumber: { type: String, default: null },
  resumeUrl: { type: String, default: null },
  profilePictureUrl: { type: String, default: null },
  isEmailVerified: { type: Boolean, default: false },
  accountStatus: { type: String, enum: ["pending","active", "suspended", "rejected"], default: "pending" }, // Pending, Active, Suspended, Rejected
  approved: { type: Boolean, default: false},
  suspendNote: { type: String, default: null },
  rejected:{type:Boolean, default:false},
  rejectedNote:{ type: String, default: null },
  doneBy: { type: String, default: null }, // ID of the admin who approved
  doneAt: { type: Date, default: null }, // Timestamp of approval
  averageRating: { type: Number, default: 0 }, // Average rating from students
  totalReviews: { type: Number, default: 0 }, // Total number of reviews received

},{timestamps: true});

export const InstructorModel = mongoose.model("Instructor", InstructorSchema);
