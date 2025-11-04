import { z } from "zod";

// User Schema
export const userRoleEnum = z.enum(["user", "customer", "staff", "admin", "founder"]);

export const insertUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  discordId: z.string().optional(),
  discordUsername: z.string().optional(),
  role: userRoleEnum.default("customer"),
  isAdmin: z.boolean().default(false),
  profilePicture: z.string().url().optional(),
});

export const userSchema = insertUserSchema.extend({
  id: z.string(),
  createdAt: z.date(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;
export type UserRole = z.infer<typeof userRoleEnum>;

// License Schema
export const licenseStatusEnum = z.enum(["active", "expired", "suspended"]);
export const licenseTypeEnum = z.enum(["lifetime", "monthly", "yearly", "custom"]);

export const insertLicenseSchema = z.object({
  key: z.string(),
  userId: z.string().optional(),
  status: licenseStatusEnum.default("active"),
  duration: z.number().default(12), // months
  productName: z.string().default("Discord Bot"),
  productDownloadUrl: z.string().url().optional(),
  licenseType: licenseTypeEnum.default("custom"),
  maxActivations: z.number().default(1),
  hwid: z.string().optional(),
  ipWhitelist: z.array(z.string()).optional(),
  discordUserId: z.string().optional(),
  note: z.string().optional(),
  guildId: z.string().optional(),
  activatedAt: z.date().optional(),
  lastHeartbeat: z.date().optional(),
  lastIpAddress: z.string().optional(),
  activationCount: z.number().default(0),
  isShutdownRequested: z.boolean().default(false),
  shutdownRequestedAt: z.date().optional(),
  shutdownClearedAt: z.date().optional(),
  shutdownReason: z.string().optional(),
  guildName: z.string().optional(),
  guildInviteUrl: z.string().optional(),
  botVersion: z.string().optional(),
});

export const licenseSchema = insertLicenseSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  expiresAt: z.date(),
});

export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type License = z.infer<typeof licenseSchema>;
export type LicenseStatus = z.infer<typeof licenseStatusEnum>;
export type LicenseType = z.infer<typeof licenseTypeEnum>;

// Bot API Key Schema
export const insertBotApiKeySchema = z.object({
  name: z.string().min(1),
  keyHash: z.string(),
  keyPrefix: z.string(),
  isActive: z.boolean().default(true),
  lastUsedAt: z.date().optional(),
  lastUsedIp: z.string().optional(),
});

export const botApiKeySchema = insertBotApiKeySchema.extend({
  id: z.string(),
  createdAt: z.date(),
});

export type InsertBotApiKey = z.infer<typeof insertBotApiKeySchema>;
export type BotApiKey = z.infer<typeof botApiKeySchema>;

// Bot Event Schema
export const botEventTypeEnum = z.enum([
  "shutdown_requested",
  "shutdown_cleared",
  "shutdown_acknowledged",
  "bot_started",
  "heartbeat_missed",
  "status_change"
]);

export const insertBotEventSchema = z.object({
  licenseId: z.string(),
  eventType: botEventTypeEnum,
  reason: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const botEventSchema = insertBotEventSchema.extend({
  id: z.string(),
  timestamp: z.date(),
});

export type InsertBotEvent = z.infer<typeof insertBotEventSchema>;
export type BotEvent = z.infer<typeof botEventSchema>;
export type BotEventType = z.infer<typeof botEventTypeEnum>;
