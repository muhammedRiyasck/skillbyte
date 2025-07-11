import mongoose from "mongoose";

const InstructorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  bio: { type: String,default: null },
  profilePictureUrl: { type: String, default: null },
  socialLinks: {
    linkedin:{ type: String, default: null },
    twitter: { type: String, default: null },
    github: { type: String, default: null },
    website: { type: String, default: null },
    youtube: { type: String, default: null }
  },
  expertise: [{ type: String }],
  isEmailVerified: { type: Boolean, default: false },
  qualifications: [{
    title: { type: String, required: true },
    year: { type: Number, required: true },
    photoUrl: { type: String, default: null }
  }],
  accountStatus: { type: String, enum: ["pending","active", "suspended", "rejected"], default: "pending" }, // Pending, Active, Suspended, Rejected
  approved: { type: Boolean, default: false},
  rejected:{type:Boolean, default:false},
  approvalNotes: { type: String, default: null },
  approvedBy: { type: String, default: null }, // ID of the admin who approved
  approvedAt: { type: Date, default: null }, // Timestamp of approval
  averageRating: { type: Number, default: 0 }, // Average rating from students
  totalReviews: { type: Number, default: 0 }, // Total number of reviews received

},{timestamps: true});

export const InstructorModel = mongoose.model("Instructor", InstructorSchema);
