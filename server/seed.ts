import { storage } from "./storage";
import { connectDB } from "./db";

export async function seedDatabase() {
  try {
    await connectDB();

    // Check if admin user already exists
    const existingAdmin = await storage.getUserByEmail("shrreyangO@gmail.com");
    
    if (!existingAdmin) {
      // Create admin user
      await storage.createUser({
        email: "shrreyangO@gmail.com",
        password: "100808",
        isAdmin: true,
      });
      console.log("✅ Admin user created: shrreyangO@gmail.com");
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    // Create some sample licenses if none exist
    const licenses = await storage.listLicenses();
    if (licenses.length === 0) {
      const licenseKeys = [
        "DISC-A1B2-C3D4-E5F6",
        "DISC-G7H8-I9J0-K1L2",
        "DISC-M3N4-O5P6-Q7R8",
      ];

      for (const key of licenseKeys) {
        await storage.createLicense({
          key,
          status: "active",
          duration: 12,
        });
      }
      console.log("✅ Sample licenses created");
    }
  } catch (error) {
    console.error("❌ Seeding error:", error);
  }
}
