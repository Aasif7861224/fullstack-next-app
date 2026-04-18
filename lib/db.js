import mongoose from "mongoose";

const globalForMongoose = globalThis;

if (!globalForMongoose.mongooseCache) {
  globalForMongoose.mongooseCache = { conn: null, promise: null };
}

export async function connectDb() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  if (mongoose.connections[0]?.readyState === 1) {
    return mongoose;
  }

  if (globalForMongoose.mongooseCache.conn) {
    return globalForMongoose.mongooseCache.conn;
  }

  if (!globalForMongoose.mongooseCache.promise) {
    globalForMongoose.mongooseCache.promise = mongoose
      .connect(mongoUri, { autoIndex: true })
      .then((mongooseInstance) => mongooseInstance)
      .catch((error) => {
        globalForMongoose.mongooseCache.promise = null;
        throw error;
      });
  }

  globalForMongoose.mongooseCache.conn =
    await globalForMongoose.mongooseCache.promise;

  return globalForMongoose.mongooseCache.conn;
}

export default connectDb;
