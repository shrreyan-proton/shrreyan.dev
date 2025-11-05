import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as DiscordStrategy } from "passport-discord";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import type { Express } from "express";

export function setupAuth(app: Express) {
  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Local Strategy (Email/Password)
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  app.use(passport.initialize());
  app.use(passport.session());
}

export async function initializeDiscordStrategy() {
  const config = await storage.getDiscordConfig();
  
  if (!config || !config.clientId || !config.clientSecret || !config.redirectUri) {
    console.log("⚠️  Discord OAuth not configured");
    return false;
  }

  passport.use(
    new DiscordStrategy(
      {
        clientID: config.clientId,
        clientSecret: config.clientSecret,
        callbackURL: config.redirectUri,
        scope: ["identify", "email"],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          let user = await storage.getUserByDiscordId(profile.id);
          
          if (user) {
            await storage.updateUser(user.id, {
              discordUsername: profile.username,
            });
            user = await storage.getUser(user.id);
            return done(null, user);
          } else {
            const newUser = await storage.createUser({
              username: profile.username,
              email: profile.email || `${profile.id}@discord.user`,
              password: Math.random().toString(36).substring(2, 15),
              discordId: profile.id,
              discordUsername: profile.username,
              isAdmin: false,
            });
            return done(null, newUser);
          }
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  console.log("✅ Discord OAuth strategy initialized");
  return true;
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

// Middleware to check if user is admin
export function isAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user?.isAdmin) {
    return next();
  }
  res.status(403).json({ error: "Forbidden - Admin access required" });
}

// Role-based permission middleware
export function hasRole(...allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const user = req.user as any;
    
    // Founder has access to everything
    if (user.role === "founder") {
      return next();
    }
    
    // Check if user's role is in the allowed list
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: `Forbidden: ${allowedRoles.join(" or ")} access required`,
        userRole: user.role 
      });
    }
    
    next();
  };
}

// Permission level check (more granular than roles)
export function hasPermission(permission: "read" | "write" | "delete" | "admin") {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const user = req.user as any;
    
    // Define permission hierarchy
    const permissions: Record<string, string[]> = {
      founder: ["read", "write", "delete", "admin"],
      admin: ["read", "write", "delete", "admin"],
      staff: ["read", "write"],
      customer: ["read"],
      user: ["read"],
    };
    
    const userPermissions = permissions[user.role] || [];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ 
        error: `Forbidden: ${permission} permission required`,
        userRole: user.role 
      });
    }
    
    next();
  };
}
