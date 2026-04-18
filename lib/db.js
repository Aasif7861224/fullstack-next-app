import mongoose from "mongoose";
import { env } from "./env.js";

if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null };
}

export async function connectDb() {
  if (global.mongooseCache.conn) {
    return global.mongooseCache.conn;
  }

  if (!global.mongooseCache.promise) {
    global.mongooseCache.promise = mongoose
      .connect(env.mongoUri, { autoIndex: true })
      .then((mongooseInstance) => mongooseInstance);
  }

  global.mongooseCache.conn = await global.mongooseCache.promise;
  return global.mongooseCache.conn;
}
