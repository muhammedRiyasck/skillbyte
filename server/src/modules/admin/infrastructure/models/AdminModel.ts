import mongoose, { Schema } from "mongoose";

const AdminSchema  = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
  isEmailVerified: { type: Boolean, default: false },
  accountStatus: { type: String, enum: ["active",'blocked', "suspended"], default: "active" },
  profilePictureUrl: { type: String, default: null },
},{timestamps: true});

export const AdminModel  = mongoose.model("Admin", AdminSchema );
