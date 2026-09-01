import mongoose from "mongoose";
import env from "./env.js";

// on serverless the same process handles many requests, so cache the connection
let cached = global.__mongoose;
if (!cached) {
  cached = global.__mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is not set. Copy backend/.env.example to backend/.env and fill it in.");
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
