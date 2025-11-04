import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, initializeDiscordStrategy } from "./auth";
import passport from "passport";
import { insertUserSchema, insertLicenseSchema } from "@shared/schema";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Initialize Discord OAuth if configured
  await initializeDiscordStrategy();

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: User login
   *     description: Authenticate user with username/email and password
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 description: Username or email address
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login error" });
        }
        const { password, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     summary: User logout
   *     description: Logout and destroy session
   *     tags: [Authentication]
   *     security:
   *       - SessionAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   */
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  /**
   * @swagger
   * /auth/me:
   *   get:
   *     summary: Get current user
   *     description: Get currently authenticated user information
   *     tags: [Authentication]
   *     security:
   *       - SessionAuth: []
   *     responses:
   *       200:
   *         description: User information retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    const { password, ...userWithoutPassword } = req.user as any;
    res.json({ user: userWithoutPassword });
  });

  /**
   * @swagger
   * /auth/discord:
   *   get:
   *     summary: Discord OAuth login
   *     description: Initiate Discord OAuth authentication flow
   *     tags: [Authentication]
   *     responses:
   *       302:
   *         description: Redirect to Discord OAuth
   *       400:
   *         description: Discord OAuth not configured
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get("/api/auth/discord", async (req, res, next) => {
    const config = await storage.getDiscordConfig();
    if (!config || !config.clientId) {
      return res.status(400).json({ error: "Discord OAuth not configured" });
    }
    passport.authenticate("discord")(req, res, next);
  });

  app.get("/api/auth/discord/callback", 
    passport.authenticate("discord", { 
      failureRedirect: "/",
      successRedirect: "/" 
    })
  );

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: List all users
   *     description: Get list of all users with their license counts (Admin only)
   *     tags: [Users]
   *     security:
   *       - SessionAuth: []
   *     responses:
   *       200:
   *         description: Users retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 allOf:
   *                   - $ref: '#/components/schemas/User'
   *                   - type: object
   *                     properties:
   *                       licensesCount:
   *                         type: integer
   *       401:
   *         description: Not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Not authorized (Admin only)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get("/api/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.listUsers();
      const usersWithLicenseCounts = await Promise.all(
        users.map(async (user) => {
          const licenses = await storage.getLicensesByUserId(user.id);
          const { password, ...userWithoutPassword } = user;
          return {
            ...userWithoutPassword,
            licensesCount: licenses.length,
          };
        })
      );
      res.json(usersWithLicenseCounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Create new user
   *     description: Create a new user (Admin only)
   *     tags: [Users]
   *     security:
   *       - SessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - email
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *               isAdmin:
   *                 type: boolean
   *               role:
   *                 type: string
   *                 enum: [founder, admin, user]
   *     responses:
   *       200:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid input
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Not authorized (Admin only)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post("/api/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Enforce that founder role always has admin privileges
      if (req.body.role === "founder") {
        req.body.isAdmin = true;
      }
      
      const validated = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validated);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const existingUser = await storage.getUser(req.params.id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Protect Shrreyan's founder role (check by email to prevent bypass via username change)
      if (existingUser.email === "shrreyango@gmail.com") {
        if (req.body.email && req.body.email !== existingUser.email) {
          return res.status(403).json({ error: "Cannot change founder's email" });
        }
        if (req.body.role && req.body.role !== "founder") {
          return res.status(403).json({ error: "Cannot change founder's role" });
        }
        if (req.body.isAdmin === false) {
          return res.status(403).json({ error: "Cannot remove founder's admin status" });
        }
      }

      // Enforce that founder role always has admin privileges
      if (req.body.role === "founder") {
        req.body.isAdmin = true;
      }

      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const existingUser = await storage.getUser(req.params.id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Protect founder from deletion (check by email)
      if (existingUser.email === "shrreyango@gmail.com") {
        return res.status(403).json({ error: "Cannot delete founder account" });
      }

      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete user" });
    }
  });

  // Profile route - allows authenticated users to update their own profile
  app.patch("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { email, isAdmin, discordId, discordUsername, currentPassword, oldPassword, ...allowedUpdates } = req.body;
      
      // Get current user to verify password
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const updates: any = {};
      
      // Profile picture can be updated without password
      if (allowedUpdates.profilePicture !== undefined) {
        updates.profilePicture = allowedUpdates.profilePicture;
      }
      
      // If updating username, verify password
      if (allowedUpdates.username) {
        if (!currentPassword) {
          return res.status(400).json({ error: "Password confirmation required to update username" });
        }
        const isValidPassword = await bcrypt.compare(currentPassword, currentUser.password);
        if (!isValidPassword) {
          return res.status(401).json({ error: "Invalid password" });
        }
        updates.username = allowedUpdates.username;
      }
      
      // If updating password, verify old password
      if (allowedUpdates.password) {
        if (!oldPassword) {
          return res.status(400).json({ error: "Current password required to change password" });
        }
        const isValidPassword = await bcrypt.compare(oldPassword, currentUser.password);
        if (!isValidPassword) {
          return res.status(401).json({ error: "Current password is incorrect" });
        }
        updates.password = allowedUpdates.password;
      }
      
      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: "Failed to update profile" });
    }
  });

  /**
   * @swagger
   * /licenses:
   *   get:
   *     summary: Get all licenses
   *     description: Retrieve list of all licenses with user information (Admin only)
   *     tags: [Licenses]
   *     security:
   *       - SessionAuth: []
   *     responses:
   *       200:
   *         description: Licenses retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 allOf:
   *                   - $ref: '#/components/schemas/License'
   *                   - type: object
   *                     properties:
   *                       userName:
   *                         type: string
   *                         nullable: true
   *       401:
   *         description: Not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Not authorized (Admin only)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get("/api/licenses", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const licenses = await storage.listLicenses();
      const licensesWithUserInfo = await Promise.all(
        licenses.map(async (license) => {
          if (license.userId) {
            const user = await storage.getUser(license.userId);
            return {
              ...license,
              userName: user?.username || user?.email || user?.discordUsername || undefined,
            };
          }
          return license;
        })
      );
      res.json(licensesWithUserInfo);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch licenses" });
    }
  });

  /**
   * @swagger
   * /licenses/my:
   *   get:
   *     summary: Get my licenses
   *     description: Get licenses belonging to the authenticated user
   *     tags: [Licenses]
   *     security:
   *       - SessionAuth: []
   *     responses:
   *       200:
   *         description: User licenses retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/License'
   *       401:
   *         description: Not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get("/api/licenses/my", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const licenses = await storage.getLicensesByUserId(userId);
      res.json(licenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch your licenses" });
    }
  });

  /**
   * @swagger
   * /licenses/admin:
   *   post:
   *     summary: Create license
   *     description: Create a new license with full control (Admin only)
   *     tags: [Licenses]
   *     security:
   *       - SessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - productName
   *               - expiresAt
   *             properties:
   *               key:
   *                 type: string
   *                 description: License key (auto-generated if not provided)
   *               productName:
   *                 type: string
   *                 description: Name of the product
   *               userId:
   *                 type: string
   *                 description: ID of the user to assign license to
   *               expiresAt:
   *                 type: string
   *                 format: date-time
   *                 description: License expiration date
   *               status:
   *                 type: string
   *                 enum: [active, suspended, expired]
   *               productDownloadUrl:
   *                 type: string
   *                 description: Download URL for the product
   *     responses:
   *       200:
   *         description: License created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/License'
   *       400:
   *         description: Invalid input
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Not authorized (Admin only)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post("/api/licenses/admin", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Generate a random license key if not provided
      const key = req.body.key || `DISC-${randomBytes(4).toString('hex').toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`;
      
      const validated = insertLicenseSchema.parse({
        ...req.body,
        key,
      });
      
      const license = await storage.createLicense(validated);
      res.json(license);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create license" });
    }
  });

  // User: Regenerate license key (users can only regenerate their own licenses)
  app.post("/api/licenses/:id/regenerate", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const license = await storage.getLicense(req.params.id);
      
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }
      
      // Check if the license belongs to the user
      if (license.userId !== userId) {
        return res.status(403).json({ error: "You can only regenerate your own licenses" });
      }
      
      // Generate new license key
      const newKey = `CRIM-${randomBytes(4).toString('hex').toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`;
      
      const updatedLicense = await storage.updateLicense(req.params.id, { key: newKey });
      res.json(updatedLicense);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to regenerate license key" });
    }
  });

  app.patch("/api/licenses/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const license = await storage.updateLicense(req.params.id, req.body);
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }
      res.json(license);
    } catch (error) {
      res.status(400).json({ error: "Failed to update license" });
    }
  });

  app.delete("/api/licenses/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteLicense(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "License not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete license" });
    }
  });

  // Discord config routes
  app.get("/api/discord-config", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const config = await storage.getDiscordConfig();
      res.json(config || { clientId: "", clientSecret: "", redirectUri: "" });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Discord configuration" });
    }
  });

  app.post("/api/discord-config", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { clientId, clientSecret, redirectUri } = req.body;
      if (!clientId || !clientSecret || !redirectUri) {
        return res.status(400).json({ error: "All fields are required" });
      }
      const config = await storage.saveDiscordConfig({ clientId, clientSecret, redirectUri });
      await initializeDiscordStrategy();
      res.json(config);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to save Discord configuration" });
    }
  });

  // Bot API Key routes
  app.get("/api/bot-api-keys", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const apiKeys = await storage.listBotApiKeys();
      res.json(apiKeys);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  app.post("/api/bot-api-keys", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "API key name is required" });
      }

      // Generate a secure random API key
      const key = `lm_${randomBytes(32).toString('hex')}`;
      const keyHash = await bcrypt.hash(key, 10);
      const keyPrefix = key.substring(0, 12);

      const apiKey = await storage.createBotApiKey({
        name,
        keyHash,
        keyPrefix,
        isActive: true,
      });

      // Return the full key ONLY on creation
      res.json({
        ...apiKey,
        key, // Full key shown only once
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create API key" });
    }
  });

  app.patch("/api/bot-api-keys/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const apiKey = await storage.updateBotApiKey(req.params.id, req.body);
      if (!apiKey) {
        return res.status(404).json({ error: "API key not found" });
      }
      res.json(apiKey);
    } catch (error) {
      res.status(400).json({ error: "Failed to update API key" });
    }
  });

  app.delete("/api/bot-api-keys/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteBotApiKey(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "API key not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete API key" });
    }
  });

  // License unbind/reset route
  app.post("/api/licenses/:id/reset", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const license = await storage.getLicense(req.params.id);
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }

      const updated = await storage.updateLicense(req.params.id, {
        guildId: undefined,
        activatedAt: undefined,
        lastHeartbeat: undefined,
        lastIpAddress: undefined,
      });

      res.json({ success: true, license: updated });
    } catch (error) {
      res.status(400).json({ error: "Failed to reset license" });
    }
  });

  // Bot Management Admin Routes
  app.get("/api/admin/bots", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const licenses = await storage.listLicenses();
      
      // Filter to only licenses with active bots (has guildId or recent heartbeat)
      const activeBots = licenses
        .filter(license => license.guildId || license.lastHeartbeat)
        .map(license => {
          const lastHeartbeat = license.lastHeartbeat ? new Date(license.lastHeartbeat) : null;
          const now = new Date();
          const minutesSinceHeartbeat = lastHeartbeat 
            ? Math.floor((now.getTime() - lastHeartbeat.getTime()) / 60000)
            : null;
          
          // Bot is online if heartbeat within last 2 minutes
          const isOnline = minutesSinceHeartbeat !== null && minutesSinceHeartbeat < 2;
          
          return {
            id: license.id,
            licenseKey: license.key,
            productName: license.productName,
            guildId: license.guildId,
            guildName: license.guildName,
            guildInviteUrl: license.guildInviteUrl,
            botVersion: license.botVersion,
            status: license.isShutdownRequested ? 'shutting_down' : (isOnline ? 'online' : 'offline'),
            lastHeartbeat: license.lastHeartbeat,
            lastIpAddress: license.lastIpAddress,
            activatedAt: license.activatedAt,
            isShutdownRequested: license.isShutdownRequested,
            shutdownReason: license.shutdownReason,
            shutdownRequestedAt: license.shutdownRequestedAt,
          };
        });

      res.json(activeBots);
    } catch (error) {
      console.error("Failed to fetch bots:", error);
      res.status(500).json({ error: "Failed to fetch bots" });
    }
  });

  app.post("/api/admin/bots/:id/shutdown", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const license = await storage.getLicense(id);
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }

      // Set shutdown flag
      await storage.updateLicense(id, {
        isShutdownRequested: true,
        shutdownRequestedAt: new Date(),
        shutdownReason: reason || "Shutdown requested by administrator",
      });

      // Log the shutdown request
      await storage.createBotEvent({
        licenseId: id,
        eventType: "shutdown_requested",
        reason: reason || "Shutdown requested by administrator",
        metadata: {
          guildId: license.guildId,
          guildName: license.guildName,
          triggeredBy: (req.user as any).username || (req.user as any).email,
        }
      });

      res.json({ 
        success: true, 
        message: "Shutdown request sent. Bot will shut down on next heartbeat check." 
      });
    } catch (error) {
      console.error("Failed to shutdown bot:", error);
      res.status(500).json({ error: "Failed to shutdown bot" });
    }
  });

  app.post("/api/admin/bots/:id/clear-shutdown", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      const license = await storage.getLicense(id);
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }

      // Clear shutdown flag
      await storage.updateLicense(id, {
        isShutdownRequested: false,
        shutdownClearedAt: new Date(),
        shutdownReason: undefined,
      });

      // Log the shutdown clear
      await storage.createBotEvent({
        licenseId: id,
        eventType: "shutdown_cleared",
        metadata: {
          guildId: license.guildId,
          guildName: license.guildName,
          triggeredBy: (req.user as any).username || (req.user as any).email,
        }
      });

      res.json({ 
        success: true, 
        message: "Shutdown flag cleared. Bot can restart normally." 
      });
    } catch (error) {
      console.error("Failed to clear shutdown:", error);
      res.status(500).json({ error: "Failed to clear shutdown" });
    }
  });

  app.get("/api/admin/bots/:id/events", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const license = await storage.getLicense(id);
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }

      const events = await storage.getBotEventsByLicenseId(id, limit);
      res.json(events);
    } catch (error) {
      console.error("Failed to fetch bot events:", error);
      res.status(500).json({ error: "Failed to fetch bot events" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
