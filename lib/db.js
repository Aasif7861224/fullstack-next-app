import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in environment variables");
}

let cached = global.mongoose || { conn: null, promise: null };

global.mongoose = cached;

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (mongoose.connection.readyState === 0) {
    cached.conn = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      })
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        cached.conn = null;
        console.error("[MongoDB] Connection failed", {
          name: error?.name,
          message: error?.message,
          code: error?.code || null,
        });
        throw error;
      });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}

export default connectDB;
