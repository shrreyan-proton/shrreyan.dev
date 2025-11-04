import mongoose, { Schema, Document } from "mongoose";

export interface ILicense extends Document {
  key: string;
  userId?: mongoose.Types.ObjectId;
  status: "active" | "expired" | "suspended";
  createdAt: Date;
  expiresAt: Date;
}

const LicenseSchema = new Schema<ILicense>({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["active", "expired", "suspended"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

export const License = mongoose.model<ILicense>("License", LicenseSchema);
