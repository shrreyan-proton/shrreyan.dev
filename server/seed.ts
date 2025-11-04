import { storage } from "./storage";
import { connectDB } from "./db";

export async function seedDatabase() {
  try {
    await connectDB();

    // Check if admin user already exists
    const existingAdmin = await storage.getUserByEmail("shrreyango@gmail.com");
    
    if (!existingAdmin) {
      // Create admin user
      await storage.createUser({
        username: "shrreyango",
        email: "shrreyango@gmail.com",
        password: "100808",
        isAdmin: true,
      });
      console.log("✅ Admin user created: shrreyango@gmail.com");
    } else {
      // Update existing admin user if it doesn't have a username
      if (!existingAdmin.username) {
        await storage.updateUser(existingAdmin.id, {
          username: "shrreyango",
          email: existingAdmin.email,
          password: existingAdmin.password,
          isAdmin: existingAdmin.isAdmin,
        });
        console.log("✅ Admin user updated with username");
      } else {
        console.log("ℹ️  Admin user already exists");
      }
    }
  } catch (error) {
    console.error("❌ Seeding error:", error);
  }
}
