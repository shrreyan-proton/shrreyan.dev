import { z } from "zod";

// User Schema
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  discordId: z.string().optional(),
  discordUsername: z.string().optional(),
  isAdmin: z.boolean().default(false),
});

export const userSchema = insertUserSchema.extend({
  id: z.string(),
  createdAt: z.date(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;

// License Schema
export const licenseStatusEnum = z.enum(["active", "expired", "suspended"]);

export const insertLicenseSchema = z.object({
  key: z.string(),
  userId: z.string().optional(),
  status: licenseStatusEnum.default("active"),
  duration: z.number().default(12), // months
});

export const licenseSchema = insertLicenseSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  expiresAt: z.date(),
});

export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type License = z.infer<typeof licenseSchema>;
export type LicenseStatus = z.infer<typeof licenseStatusEnum>;
