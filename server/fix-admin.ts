import { storage } from "./storage";
import { connectDB } from "./db";
import { User } from "./models/User";
import { initializeUserIdCounter } from "./models/Counter";
import bcrypt from "bcryptjs";

async function fixAdminUser() {
  try {
    await connectDB();
    console.log("Connected to database");

    await initializeUserIdCounter();
    console.log("✅ User ID counter initialized");

    const admin = await storage.getUserByEmail("shrreyango@gmail.com");
    
    if (!admin) {
      console.log("Admin user not found, creating with userId=1...");
      
      const hashedPassword = await bcrypt.hash("100808", 10);
      await User.create({
        userId: 1,
        username: "Shrreyan",
        email: "shrreyango@gmail.com",
        password: hashedPassword,
        isAdmin: true,
        role: "founder",
      });
      
      console.log("✅ Admin user created with userId=1");
    } else {
      console.log("Admin user found:", {
        id: admin.id,
        userId: admin.userId,
        username: admin.username,
        email: admin.email,
        isAdmin: admin.isAdmin,
        role: admin.role,
      });

      if (!admin.isAdmin || admin.role !== "founder") {
        console.log("Updating user to founder admin...");
        await storage.updateUser(admin.id, {
          username: admin.username || "Shrreyan",
          email: admin.email,
          password: admin.password,
          isAdmin: true,
          role: "founder",
        });
        console.log("✅ User updated to founder admin");
      } else {
        console.log("✅ User is already founder admin");
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixAdminUser();
