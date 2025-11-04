import mongoose, { Schema, Document } from "mongoose";

export interface ILicense extends Document {
  key: string;
  userId?: mongoose.Types.ObjectId;
  status: "active" | "expired" | "suspended";
  createdAt: Date;
  expiresAt: Date;
  productName: string;
  licenseType: "lifetime" | "monthly" | "yearly" | "custom";
  maxActivations?: number;
  hwid?: string;
  ipWhitelist?: string[];
  discordServerId?: string;
  note?: string;
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
  productName: {
    type: String,
    default: "Discord Bot",
  },
  licenseType: {
    type: String,
    enum: ["lifetime", "monthly", "yearly", "custom"],
    default: "custom",
  },
  maxActivations: {
    type: Number,
  },
  hwid: {
    type: String,
  },
  ipWhitelist: {
    type: [String],
  },
  discordServerId: {
    type: String,
  },
  note: {
    type: String,
  },
});

export const License = mongoose.model<ILicense>("License", LicenseSchema);
