import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  discordId?: string;
  discordUsername?: string;
  role: "user" | "customer" | "staff" | "admin" | "founder";
  isAdmin: boolean;
  profilePicture?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  discordId: {
    type: String,
    unique: true,
    sparse: true,
  },
  discordUsername: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "customer", "staff", "admin", "founder"],
    default: "customer",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  profilePicture: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model<IUser>("User", UserSchema);
