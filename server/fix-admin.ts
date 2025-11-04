import { storage } from "./storage";
import { connectDB } from "./db";

async function fixAdminUser() {
  try {
    await connectDB();
    console.log("Connected to database");

    const admin = await storage.getUserByEmail("shrreyango@gmail.com");
    
    if (!admin) {
      console.log("Admin user not found, creating...");
      await storage.createUser({
        username: "shrreyango",
        email: "shrreyango@gmail.com",
        password: "100808",
        isAdmin: true,
      });
      console.log("✅ Admin user created");
    } else {
      console.log("Admin user found:", {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        isAdmin: admin.isAdmin,
      });

      if (!admin.isAdmin) {
        console.log("Updating user to admin...");
        await storage.updateUser(admin.id, {
          username: admin.username || "shrreyango",
          email: admin.email,
          password: admin.password,
          isAdmin: true,
        });
        console.log("✅ User updated to admin");
      } else {
        console.log("✅ User is already admin");
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixAdminUser();
