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
        email: "shrreyango@gmail.com",
        password: "100808",
        isAdmin: true,
      });
      console.log("✅ Admin user created: shrreyango@gmail.com");
    } else {
      console.log("ℹ️  Admin user already exists");
    }
  } catch (error) {
    console.error("❌ Seeding error:", error);
  }
}
