import type { Express } from "express";
import { storage } from "./storage";
import crypto from "crypto";

// Middleware to verify bot API key
async function verifyBotApiKey(req: any, res: any, next: any) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  const key = await storage.getBotApiKeyByKey(apiKey as string);

  if (!key || !key.isActive) {
    return res.status(401).json({ error: "Invalid or inactive API key" });
  }

  // Update last used info
  await storage.updateBotApiKey(key.id, {
    lastUsedAt: new Date(),
    lastUsedIp: req.ip || req.socket.remoteAddress,
  });

  next();
}

// Rate limiting map: apiKey -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute per API key

function rateLimit(req: any, res: any, next: any) {
  const apiKey = req.headers["x-api-key"] as string;
  const now = Date.now();

  if (!rateLimitMap.has(apiKey)) {
    rateLimitMap.set(apiKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return next();
  }

  const record = rateLimitMap.get(apiKey)!;

  if (now > record.resetAt) {
    // Reset the window
    record.count = 1;
    record.resetAt = now + RATE_LIMIT_WINDOW;
    return next();
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  record.count++;
  next();
}

export function registerBotRoutes(app: Express) {
  // Activate a license (bind to guild ID)
  app.post("/api/bot/activate", verifyBotApiKey, rateLimit, async (req, res) => {
    try {
      const { licenseKey, guildId } = req.body;

      if (!licenseKey || !guildId) {
        return res.status(400).json({ error: "License key and guild ID required" });
      }

      const license = await storage.getLicenseByKey(licenseKey);

      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }

      // Check if license is expired
      if (new Date() > new Date(license.expiresAt)) {
        return res.status(403).json({ 
          error: "License expired",
          expiresAt: license.expiresAt
        });
      }

      // Check if license is suspended
      if (license.status === "suspended") {
        return res.status(403).json({ error: "License suspended" });
      }

      // Check if already activated on a different guild
      if (license.guildId && license.guildId !== guildId) {
        return res.status(403).json({ 
          error: "License already activated on another server",
          activatedGuildId: license.guildId
        });
      }

      // If already activated on this guild, just return success
      if (license.guildId === guildId) {
        await storage.updateLicense(license.id, {
          lastHeartbeat: new Date(),
          lastIpAddress: req.ip || req.socket.remoteAddress,
        });

        return res.json({
          success: true,
          message: "License already activated on this server",
          license: {
            key: license.key,
            productName: license.productName,
            expiresAt: license.expiresAt,
            status: license.status,
            guildId: license.guildId,
          }
        });
      }

      // Activate license
      await storage.updateLicense(license.id, {
        guildId,
        activatedAt: new Date(),
        lastHeartbeat: new Date(),
        lastIpAddress: req.ip || req.socket.remoteAddress,
        activationCount: (license.activationCount || 0) + 1,
      });

      res.json({
        success: true,
        message: "License activated successfully",
        license: {
          key: license.key,
          productName: license.productName,
          expiresAt: license.expiresAt,
          status: license.status,
          guildId,
        }
      });
    } catch (error: any) {
      console.error("Activation error:", error);
      res.status(500).json({ error: "Activation failed" });
    }
  });

  // Verify license (heartbeat)
  app.post("/api/bot/verify", verifyBotApiKey, rateLimit, async (req, res) => {
    try {
      const { licenseKey, guildId } = req.body;

      if (!licenseKey || !guildId) {
        return res.status(400).json({ 
          valid: false, 
          error: "License key and guild ID required" 
        });
      }

      const license = await storage.getLicenseByKey(licenseKey);

      if (!license) {
        return res.json({ 
          valid: false, 
          error: "License not found" 
        });
      }

      // Check if license is bound to a different guild
      if (license.guildId && license.guildId !== guildId) {
        return res.json({ 
          valid: false, 
          error: "License not authorized for this server" 
        });
      }

      // Check if license is expired
      if (new Date() > new Date(license.expiresAt)) {
        return res.json({ 
          valid: false, 
          error: "License expired",
          expiresAt: license.expiresAt
        });
      }

      // Check if license is suspended
      if (license.status === "suspended") {
        return res.json({ 
          valid: false, 
          error: "License suspended" 
        });
      }

      // Update heartbeat
      await storage.updateLicense(license.id, {
        lastHeartbeat: new Date(),
        lastIpAddress: req.ip || req.socket.remoteAddress,
      });

      res.json({
        valid: true,
        license: {
          key: license.key,
          productName: license.productName,
          expiresAt: license.expiresAt,
          status: license.status,
          guildId: license.guildId,
          productDownloadUrl: license.productDownloadUrl,
        }
      });
    } catch (error: any) {
      console.error("Verification error:", error);
      res.status(500).json({ valid: false, error: "Verification failed" });
    }
  });

  // Get license info (for bot to check details)
  app.get("/api/bot/license/:key", verifyBotApiKey, rateLimit, async (req, res) => {
    try {
      const { key } = req.params;

      const license = await storage.getLicenseByKey(key);

      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }

      res.json({
        key: license.key,
        productName: license.productName,
        status: license.status,
        expiresAt: license.expiresAt,
        guildId: license.guildId,
        activatedAt: license.activatedAt,
        lastHeartbeat: license.lastHeartbeat,
      });
    } catch (error: any) {
      console.error("License info error:", error);
      res.status(500).json({ error: "Failed to get license info" });
    }
  });
}
