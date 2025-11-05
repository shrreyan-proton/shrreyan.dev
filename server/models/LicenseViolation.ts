import mongoose, { Schema, Document } from "mongoose";

export interface ILicenseViolation extends Document {
  licenseId: string;
  userId?: string;
  licenseKey: string;
  violationType: "max_activations_exceeded" | "expired_license" | "suspended_license" | "invalid_license";
  attemptedGuildId: string;
  attemptedGuildName?: string;
  currentGuildId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  emailSent: boolean;
  createdAt: Date;
}

const LicenseViolationSchema = new Schema<ILicenseViolation>({
  licenseId: {
    type: String,
    required: true,
    ref: "License",
  },
  userId: {
    type: String,
    ref: "User",
  },
  licenseKey: {
    type: String,
    required: true,
  },
  violationType: {
    type: String,
    enum: ["max_activations_exceeded", "expired_license", "suspended_license", "invalid_license"],
    required: true,
  },
  attemptedGuildId: {
    type: String,
    required: true,
  },
  attemptedGuildName: {
    type: String,
  },
  currentGuildId: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

LicenseViolationSchema.index({ licenseId: 1, createdAt: -1 });
LicenseViolationSchema.index({ userId: 1, createdAt: -1 });

export const LicenseViolation = mongoose.model<ILicenseViolation>("LicenseViolation", LicenseViolationSchema);
