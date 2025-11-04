import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://licence_manager:j0nX79ynJE47KGP9@botdb.jyixcvf.mongodb.net/?appName=BotDB";

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "license_manager",
    });
    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

export async function disconnectDB() {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ MongoDB disconnection error:", error);
    throw error;
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});
