import { type User as UserType, type InsertUser, type License as LicenseType, type InsertLicense, type BotApiKey as BotApiKeyType, type InsertBotApiKey, type BotEvent as BotEventType, type InsertBotEvent } from "@shared/schema";
import { User } from "./models/User";
import { License } from "./models/License";
import { DiscordConfig } from "./models/DiscordConfig";
import { BotApiKey } from "./models/BotApiKey";
import { BotEvent } from "./models/BotEvent";
import { getNextUserId } from "./models/Counter";
import bcrypt from "bcryptjs";

export interface DiscordConfigType {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface IStorage {
  // User methods
  getUser(id: string): Promise<UserType | null>;
  getUserByEmail(email: string): Promise<UserType | null>;
  getUserByDiscordId(discordId: string): Promise<UserType | null>;
  createUser(user: InsertUser): Promise<UserType>;
  listUsers(): Promise<UserType[]>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<UserType | null>;
  deleteUser(id: string): Promise<boolean>;

  // License methods
  getLicense(id: string): Promise<LicenseType | null>;
  getLicenseByKey(key: string): Promise<LicenseType | null>;
  createLicense(license: InsertLicense): Promise<LicenseType>;
  listLicenses(): Promise<LicenseType[]>;
  updateLicense(id: string, updates: Partial<LicenseType>): Promise<LicenseType | null>;
  deleteLicense(id: string): Promise<boolean>;
  getLicensesByUserId(userId: string): Promise<LicenseType[]>;

  // Discord config methods
  getDiscordConfig(): Promise<DiscordConfigType | null>;
  saveDiscordConfig(config: DiscordConfigType): Promise<DiscordConfigType>;

  // Bot API Key methods
  getBotApiKey(id: string): Promise<BotApiKeyType | null>;
  getBotApiKeyByKey(key: string): Promise<BotApiKeyType | null>;
  createBotApiKey(apiKey: InsertBotApiKey): Promise<BotApiKeyType>;
  listBotApiKeys(): Promise<BotApiKeyType[]>;
  updateBotApiKey(id: string, updates: Partial<InsertBotApiKey>): Promise<BotApiKeyType | null>;
  deleteBotApiKey(id: string): Promise<boolean>;

  // Bot Event methods
  createBotEvent(event: InsertBotEvent): Promise<BotEventType>;
  getBotEventsByLicenseId(licenseId: string, limit?: number): Promise<BotEventType[]>;
}

export class MongoStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<UserType | null> {
    const user = await User.findById(id);
    return user ? this.formatUser(user) : null;
  }

  async getUserByEmail(email: string): Promise<UserType | null> {
    const user = await User.findOne({ email: email.toLowerCase() });
    return user ? this.formatUser(user) : null;
  }

  async getUserByDiscordId(discordId: string): Promise<UserType | null> {
    const user = await User.findOne({ discordId });
    return user ? this.formatUser(user) : null;
  }

  async createUser(insertUser: InsertUser): Promise<UserType> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const userId = await getNextUserId();
    const user = await User.create({
      ...insertUser,
      userId,
      password: hashedPassword,
      email: insertUser.email.toLowerCase(),
    });
    return this.formatUser(user);
  }

  async listUsers(): Promise<UserType[]> {
    const users = await User.find();
    return users.map((user) => this.formatUser(user));
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<UserType | null> {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    return user ? this.formatUser(user) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return result !== null;
  }

  // License methods
  async getLicense(id: string): Promise<LicenseType | null> {
    const license = await License.findById(id).populate("userId", "username email discordUsername");
    return license ? this.formatLicense(license) : null;
  }

  async getLicenseByKey(key: string): Promise<LicenseType | null> {
    const license = await License.findOne({ key }).populate("userId", "username email discordUsername");
    return license ? this.formatLicense(license) : null;
  }

  async createLicense(insertLicense: InsertLicense): Promise<LicenseType> {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + insertLicense.duration);

    const license = await License.create({
      ...insertLicense,
      expiresAt,
    });

    return this.formatLicense(license);
  }

  async listLicenses(): Promise<LicenseType[]> {
    const licenses = await License.find().populate("userId", "username email discordUsername");
    return licenses.map((license) => this.formatLicense(license));
  }

  async updateLicense(id: string, updates: Partial<LicenseType>): Promise<LicenseType | null> {
    const license = await License.findByIdAndUpdate(id, updates, { new: true }).populate("userId", "username email discordUsername");
    return license ? this.formatLicense(license) : null;
  }

  async deleteLicense(id: string): Promise<boolean> {
    const result = await License.findByIdAndDelete(id);
    return result !== null;
  }

  async getLicensesByUserId(userId: string): Promise<LicenseType[]> {
    const licenses = await License.find({ userId }).populate("userId", "username email discordUsername");
    return licenses.map((license) => this.formatLicense(license));
  }

  // Discord config methods
  async getDiscordConfig(): Promise<DiscordConfigType | null> {
    const config = await DiscordConfig.findOne();
    if (!config) return null;
    return {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
    };
  }

  async saveDiscordConfig(configData: DiscordConfigType): Promise<DiscordConfigType> {
    const existing = await DiscordConfig.findOne();
    if (existing) {
      existing.clientId = configData.clientId;
      existing.clientSecret = configData.clientSecret;
      existing.redirectUri = configData.redirectUri;
      existing.updatedAt = new Date();
      await existing.save();
      return {
        clientId: existing.clientId,
        clientSecret: existing.clientSecret,
        redirectUri: existing.redirectUri,
      };
    } else {
      const config = await DiscordConfig.create(configData);
      return {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri: config.redirectUri,
      };
    }
  }

  // Bot API Key methods
  async getBotApiKey(id: string): Promise<BotApiKeyType | null> {
    const apiKey = await BotApiKey.findById(id);
    return apiKey ? this.formatBotApiKey(apiKey) : null;
  }

  async getBotApiKeyByKey(key: string): Promise<BotApiKeyType | null> {
    const allKeys = await BotApiKey.find({ isActive: true });
    
    for (const apiKey of allKeys) {
      const isMatch = await bcrypt.compare(key, apiKey.keyHash);
      if (isMatch) {
        return this.formatBotApiKey(apiKey);
      }
    }
    
    return null;
  }

  async createBotApiKey(insertApiKey: InsertBotApiKey): Promise<BotApiKeyType> {
    const apiKey = await BotApiKey.create(insertApiKey);
    return this.formatBotApiKey(apiKey);
  }

  async listBotApiKeys(): Promise<BotApiKeyType[]> {
    const apiKeys = await BotApiKey.find();
    return apiKeys.map((apiKey) => this.formatBotApiKey(apiKey));
  }

  async updateBotApiKey(id: string, updates: Partial<InsertBotApiKey>): Promise<BotApiKeyType | null> {
    const apiKey = await BotApiKey.findByIdAndUpdate(id, updates, { new: true });
    return apiKey ? this.formatBotApiKey(apiKey) : null;
  }

  async deleteBotApiKey(id: string): Promise<boolean> {
    const result = await BotApiKey.findByIdAndDelete(id);
    return result !== null;
  }

  // Bot Event methods
  async createBotEvent(insertEvent: InsertBotEvent): Promise<BotEventType> {
    const event = await BotEvent.create(insertEvent);
    return this.formatBotEvent(event);
  }

  async getBotEventsByLicenseId(licenseId: string, limit: number = 50): Promise<BotEventType[]> {
    const events = await BotEvent.find({ licenseId })
      .sort({ timestamp: -1 })
      .limit(limit);
    return events.map((event) => this.formatBotEvent(event));
  }

  // Helper methods
  private formatUser(user: any): UserType {
    return {
      id: user._id.toString(),
      userId: user.userId,
      username: user.username,
      email: user.email,
      password: user.password,
      discordId: user.discordId,
      discordUsername: user.discordUsername,
      role: user.role ?? (user.isAdmin ? "admin" : "customer"),
      isAdmin: user.isAdmin,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    };
  }

  private formatLicense(license: any): LicenseType {
    return {
      id: license._id.toString(),
      key: license.key,
      userId: license.userId?._id?.toString(),
      status: license.status,
      createdAt: license.createdAt,
      expiresAt: license.expiresAt,
      duration: license.duration || 12,
      productName: license.productName || "Discord Bot",
      productDownloadUrl: license.productDownloadUrl,
      licenseType: license.licenseType || "custom",
      maxActivations: license.maxActivations || 1,
      hwid: license.hwid,
      ipWhitelist: license.ipWhitelist,
      discordUserId: license.discordUserId,
      note: license.note,
      guildId: license.guildId,
      activatedAt: license.activatedAt,
      lastHeartbeat: license.lastHeartbeat,
      lastIpAddress: license.lastIpAddress,
      activationCount: license.activationCount || 0,
      isShutdownRequested: license.isShutdownRequested || false,
      shutdownRequestedAt: license.shutdownRequestedAt,
      shutdownClearedAt: license.shutdownClearedAt,
      shutdownReason: license.shutdownReason,
      guildName: license.guildName,
      guildInviteUrl: license.guildInviteUrl,
      botVersion: license.botVersion,
    };
  }

  private formatBotApiKey(apiKey: any): BotApiKeyType {
    return {
      id: apiKey._id.toString(),
      name: apiKey.name,
      keyHash: apiKey.keyHash,
      keyPrefix: apiKey.keyPrefix,
      isActive: apiKey.isActive,
      lastUsedAt: apiKey.lastUsedAt,
      lastUsedIp: apiKey.lastUsedIp,
      createdAt: apiKey.createdAt,
    };
  }

  private formatBotEvent(event: any): BotEventType {
    return {
      id: event._id.toString(),
      licenseId: event.licenseId.toString(),
      eventType: event.eventType,
      timestamp: event.timestamp,
      reason: event.reason,
      metadata: event.metadata,
    };
  }
}

export const storage = new MongoStorage();
