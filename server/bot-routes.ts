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
  /**
   * @swagger
   * /bot/activate:
   *   post:
   *     summary: Activate a license
   *     description: Binds a license to a Discord guild ID. Once activated, the license can only be used on that specific guild.
   *     tags: [Bot Integration]
   *     security:
   *       - BotApiKey: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - licenseKey
   *               - guildId
   *             properties:
   *               licenseKey:
   *                 type: string
   *                 example: "DISC-XXXX-XXXX-XXXX"
   *                 description: The license key to activate
   *               guildId:
   *                 type: string
   *                 example: "1234567890123456789"
   *                 description: Discord guild (server) ID
   *     responses:
   *       200:
   *         description: License activated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 license:
   *                   type: object
   *                   properties:
   *                     key:
   *                       type: string
   *                     productName:
   *                       type: string
   *                     expiresAt:
   *                       type: string
   *                       format: date-time
   *                     status:
   *                       type: string
   *                     guildId:
   *                       type: string
   *       400:
   *         description: Missing required fields
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Invalid or missing API key
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: License expired, suspended, or already activated on another guild
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: License not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       429:
   *         description: Rate limit exceeded (100 requests per minute)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /bot/verify:
   *   post:
   *     summary: Verify license validity (heartbeat)
   *     description: Checks if a license is valid, active, and authorized for the specified guild. Should be called periodically (every 60 seconds) to ensure license remains valid.
   *     tags: [Bot Integration]
   *     security:
   *       - BotApiKey: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - licenseKey
   *               - guildId
   *             properties:
   *               licenseKey:
   *                 type: string
   *                 example: "DISC-XXXX-XXXX-XXXX"
   *                 description: The license key to verify
   *               guildId:
   *                 type: string
   *                 example: "1234567890123456789"
   *                 description: Discord guild (server) ID
   *     responses:
   *       200:
   *         description: License verification result
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 valid:
   *                   type: boolean
   *                   description: Whether the license is valid
   *                 license:
   *                   type: object
   *                   description: License details (only present if valid is true)
   *                   properties:
   *                     key:
   *                       type: string
   *                     productName:
   *                       type: string
   *                     expiresAt:
   *                       type: string
   *                       format: date-time
   *                     status:
   *                       type: string
   *                     guildId:
   *                       type: string
   *                     productDownloadUrl:
   *                       type: string
   *                       nullable: true
   *                 error:
   *                   type: string
   *                   description: Error message (only present if valid is false)
   *       401:
   *         description: Invalid or missing API key
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       429:
   *         description: Rate limit exceeded
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

      // Update heartbeat and bot metadata
      const updates: any = {
        lastHeartbeat: new Date(),
        lastIpAddress: req.ip || req.socket.remoteAddress,
      };

      // Update optional bot metadata if provided
      if (req.body.botVersion) {
        updates.botVersion = req.body.botVersion;
      }
      if (req.body.guildName) {
        updates.guildName = req.body.guildName;
      }
      if (req.body.guildInviteUrl) {
        updates.guildInviteUrl = req.body.guildInviteUrl;
      }

      await storage.updateLicense(license.id, updates);

      // Check if shutdown is requested
      const action = license.isShutdownRequested ? {
        type: "shutdown",
        reason: license.shutdownReason || "Shutdown requested by administrator",
        requestedAt: license.shutdownRequestedAt
      } : null;

      res.json({
        valid: true,
        action: action,
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

  /**
   * @swagger
   * /bot/license/{key}:
   *   get:
   *     summary: Get license information
   *     description: Retrieves detailed information about a license by its key
   *     tags: [Bot Integration]
   *     security:
   *       - BotApiKey: []
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         schema:
   *           type: string
   *         description: License key
   *         example: "DISC-XXXX-XXXX-XXXX"
   *     responses:
   *       200:
   *         description: License information retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 key:
   *                   type: string
   *                 productName:
   *                   type: string
   *                 status:
   *                   type: string
   *                 expiresAt:
   *                   type: string
   *                   format: date-time
   *                 guildId:
   *                   type: string
   *                   nullable: true
   *                 activatedAt:
   *                   type: string
   *                   format: date-time
   *                   nullable: true
   *                 lastHeartbeat:
   *                   type: string
   *                   format: date-time
   *                   nullable: true
   *       401:
   *         description: Invalid or missing API key
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: License not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       429:
   *         description: Rate limit exceeded
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /bot/shutdown-ack:
   *   post:
   *     summary: Acknowledge shutdown
   *     description: Bot calls this endpoint to acknowledge that it received the shutdown command and is shutting down
   *     tags: [Bot Integration]
   *     security:
   *       - BotApiKey: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - licenseKey
   *             properties:
   *               licenseKey:
   *                 type: string
   *                 example: "DISC-XXXX-XXXX-XXXX"
   *                 description: The license key
   *     responses:
   *       200:
   *         description: Shutdown acknowledged
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       401:
   *         description: Invalid or missing API key
   *       404:
   *         description: License not found
   */
  app.post("/api/bot/shutdown-ack", verifyBotApiKey, rateLimit, async (req, res) => {
    try {
      const { licenseKey } = req.body;

      if (!licenseKey) {
        return res.status(400).json({ error: "License key required" });
      }

      const license = await storage.getLicenseByKey(licenseKey);

      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }

      // Clear the shutdown flag so bot can restart
      await storage.updateLicense(license.id, {
        isShutdownRequested: false,
        shutdownClearedAt: new Date(),
      });

      // Log the shutdown acknowledgment
      await storage.createBotEvent({
        licenseId: license.id,
        eventType: "shutdown_acknowledged",
        reason: license.shutdownReason,
        metadata: {
          guildId: license.guildId,
          guildName: license.guildName,
          botVersion: license.botVersion,
          ipAddress: req.ip || req.socket.remoteAddress,
        }
      });

      res.json({
        success: true,
        message: "Shutdown acknowledged and flag cleared"
      });
    } catch (error: any) {
      console.error("Shutdown ack error:", error);
      res.status(500).json({ error: "Failed to acknowledge shutdown" });
    }
  });
}
