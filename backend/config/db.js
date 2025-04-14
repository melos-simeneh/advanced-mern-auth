const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 5000;

const mongoDBConnection = async (retries = 0) => {
  try {
    if (!process.env.MONGO_DB_URL) {
      throw new Error(
        "MongoDB connection URL is not defined in environment variables"
      );
    }

    await mongoose.connect(process.env.MONGO_DB_URL, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });

    console.log("✅ MongoDB connected successfully");

    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to DB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("Mongoose disconnected from DB");
    });
  } catch (err) {
    console.error(
      `❌ DB connection failed (attempt ${retries + 1}/${MAX_RETRIES}):`,
      err.message
    );

    if (retries < MAX_RETRIES) {
      const delay = Math.min(
        INITIAL_RETRY_DELAY * Math.pow(2, retries) + Math.random() * 1000,
        MAX_RETRY_DELAY
      );

      console.log(`Retrying in ${Math.round(delay)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return mongoDBConnection(retries + 1);
    } else {
      console.error(
        "💥 Max connection retries reached. Application will exit."
      );
      process.exit(1);
    }
  }
};

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Mongoose connection closed due to application termination");
  process.exit(0);
});

module.exports = mongoDBConnection;
