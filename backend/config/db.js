import mongoose from "mongoose";

// cache the connection so serverless invocations reuse one socket
let cached = global.__mongoose;
if (!cached) cached = global.__mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Copy backend/.env.example to backend/.env and fill it in.");
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000, // atlas can be slow to answer on a cold start
        family: 4, // force ipv4, some windows setups hang on ipv6 dns
      })
      .catch((err) => {
        // let the next call retry instead of reusing a rejected promise
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  console.log("connected to mongodb");
  return cached.conn;
}

export default connectDB;
