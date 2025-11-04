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

  // Auth routes
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

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    const { password, ...userWithoutPassword } = req.user as any;
    res.json({ user: userWithoutPassword });
  });

  // Discord OAuth routes
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

  // User routes
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

  // License routes
  // Admin: Get all licenses
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

  // User: Get only their own licenses
  app.get("/api/licenses/my", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const licenses = await storage.getLicensesByUserId(userId);
      res.json(licenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch your licenses" });
    }
  });

  // Admin: Create license with full control
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

  const httpServer = createServer(app);

  return httpServer;
}
