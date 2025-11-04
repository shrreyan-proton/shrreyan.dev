import mongoose, { Schema, Document } from "mongoose";

export interface ILicense extends Document {
  key: string;
  userId?: mongoose.Types.ObjectId;
  status: "active" | "expired" | "suspended";
  createdAt: Date;
  expiresAt: Date;
  productName: string;
  productDownloadUrl?: string;
  licenseType: "lifetime" | "monthly" | "yearly" | "custom";
  maxActivations?: number;
  hwid?: string;
  ipWhitelist?: string[];
  discordUserId?: string;
  note?: string;
  guildId?: string;
  activatedAt?: Date;
  lastHeartbeat?: Date;
  lastIpAddress?: string;
  activationCount: number;
  isShutdownRequested?: boolean;
  shutdownRequestedAt?: Date;
  shutdownClearedAt?: Date;
  shutdownReason?: string;
  guildName?: string;
  guildInviteUrl?: string;
  botVersion?: string;
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
  productDownloadUrl: {
    type: String,
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
  discordUserId: {
    type: String,
  },
  note: {
    type: String,
  },
  guildId: {
    type: String,
  },
  activatedAt: {
    type: Date,
  },
  lastHeartbeat: {
    type: Date,
  },
  lastIpAddress: {
    type: String,
  },
  activationCount: {
    type: Number,
    default: 0,
  },
  isShutdownRequested: {
    type: Boolean,
    default: false,
  },
  shutdownRequestedAt: {
    type: Date,
  },
  shutdownClearedAt: {
    type: Date,
  },
  shutdownReason: {
    type: String,
  },
  guildName: {
    type: String,
  },
  guildInviteUrl: {
    type: String,
  },
  botVersion: {
    type: String,
  },
});

export const License = mongoose.model<ILicense>("License", LicenseSchema);
