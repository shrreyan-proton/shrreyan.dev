import mongoose, { Schema, Document } from "mongoose";

export interface IBotEvent extends Document {
  licenseId: mongoose.Types.ObjectId;
  eventType: "shutdown_requested" | "shutdown_cleared" | "shutdown_acknowledged" | "bot_started" | "heartbeat_missed" | "status_change";
  timestamp: Date;
  reason?: string;
  metadata?: {
    guildId?: string;
    guildName?: string;
    botVersion?: string;
    ipAddress?: string;
    triggeredBy?: string;
    [key: string]: any;
  };
}

const BotEventSchema = new Schema<IBotEvent>({
  licenseId: {
    type: Schema.Types.ObjectId,
    ref: "License",
    required: true,
    index: true,
  },
  eventType: {
    type: String,
    enum: ["shutdown_requested", "shutdown_cleared", "shutdown_acknowledged", "bot_started", "heartbeat_missed", "status_change"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  reason: {
    type: String,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
});

BotEventSchema.index({ licenseId: 1, timestamp: -1 });

export const BotEvent = mongoose.model<IBotEvent>("BotEvent", BotEventSchema);
