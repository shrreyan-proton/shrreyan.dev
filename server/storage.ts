import { type User as UserType, type InsertUser, type License as LicenseType, type InsertLicense } from "@shared/schema";
import { User } from "./models/User";
import { License } from "./models/License";
import bcrypt from "bcryptjs";

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
    const user = await User.create({
      ...insertUser,
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
    const license = await License.findById(id).populate("userId", "email discordUsername");
    return license ? this.formatLicense(license) : null;
  }

  async getLicenseByKey(key: string): Promise<LicenseType | null> {
    const license = await License.findOne({ key }).populate("userId", "email discordUsername");
    return license ? this.formatLicense(license) : null;
  }

  async createLicense(insertLicense: InsertLicense): Promise<LicenseType> {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + insertLicense.duration);

    const license = await License.create({
      key: insertLicense.key,
      userId: insertLicense.userId || undefined,
      status: insertLicense.status,
      expiresAt,
    });

    return this.formatLicense(license);
  }

  async listLicenses(): Promise<LicenseType[]> {
    const licenses = await License.find().populate("userId", "email discordUsername");
    return licenses.map((license) => this.formatLicense(license));
  }

  async updateLicense(id: string, updates: Partial<LicenseType>): Promise<LicenseType | null> {
    const license = await License.findByIdAndUpdate(id, updates, { new: true }).populate("userId", "email discordUsername");
    return license ? this.formatLicense(license) : null;
  }

  async deleteLicense(id: string): Promise<boolean> {
    const result = await License.findByIdAndDelete(id);
    return result !== null;
  }

  async getLicensesByUserId(userId: string): Promise<LicenseType[]> {
    const licenses = await License.find({ userId }).populate("userId", "email discordUsername");
    return licenses.map((license) => this.formatLicense(license));
  }

  // Helper methods
  private formatUser(user: any): UserType {
    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      discordId: user.discordId,
      discordUsername: user.discordUsername,
      isAdmin: user.isAdmin,
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
      duration: 12, // default, can be calculated from dates if needed
    };
  }
}

export const storage = new MongoStorage();
