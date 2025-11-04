import mongoose, { Schema, Document } from "mongoose";

export interface IBotApiKey extends Document {
  name: string;
  keyHash: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt?: Date;
  lastUsedIp?: string;
  createdAt: Date;
}

const BotApiKeySchema = new Schema<IBotApiKey>({
  name: {
    type: String,
    required: true,
  },
  keyHash: {
    type: String,
    required: true,
    unique: true,
  },
  keyPrefix: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUsedAt: {
    type: Date,
  },
  lastUsedIp: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const BotApiKey = mongoose.model<IBotApiKey>("BotApiKey", BotApiKeySchema);
