import mongoose, { Schema, Document } from "mongoose";

export interface IDiscordConfig extends Document {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  updatedAt: Date;
}

const DiscordConfigSchema = new Schema<IDiscordConfig>({
  clientId: {
    type: String,
    required: true,
  },
  clientSecret: {
    type: String,
    required: true,
  },
  redirectUri: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const DiscordConfig = mongoose.model<IDiscordConfig>("DiscordConfig", DiscordConfigSchema);
