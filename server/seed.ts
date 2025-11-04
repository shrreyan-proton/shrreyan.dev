import { storage } from "./storage";
import { connectDB } from "./db";

export async function seedDatabase() {
  try {
    await connectDB();

    // Check if admin user already exists
    const existingAdmin = await storage.getUserByEmail("shrreyango@gmail.com");
    
    if (!existingAdmin) {
      // Create admin user with founder role
      await storage.createUser({
        username: "shrreyango",
        email: "shrreyango@gmail.com",
        password: "100808",
        role: "founder",
        isAdmin: true,
      });
      console.log("✅ Founder user created: shrreyango@gmail.com");
    } else {
      // Update existing admin user to founder role and reset password
      await storage.updateUser(existingAdmin.id, {
        username: existingAdmin.username || "shrreyango",
        password: "100808",
        role: "founder",
        isAdmin: true,
      });
      console.log("✅ Founder user updated: shrreyango@gmail.com");
    }
  } catch (error) {
    console.error("❌ Seeding error:", error);
  }
}
