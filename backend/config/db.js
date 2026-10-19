import dns from "dns";

// Only override system DNS on local machines, never in cloud serverless (Vercel/Lambda)
if (!process.env.VERCEL) {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  } catch (e) {}
}

import mongoose from "mongoose";

// cache the connection so serverless invocations reuse one socket
let cached = global.__mongoose;
if (!cached) cached = global.__mongoose = { conn: null, promise: null };

const fallbackMongoUri =
  "mongodb+srv://abdallehussein8_db_user:RWOGl6Sbn102I3ut@cluster0.97ylkl1.mongodb.net/school_management?retryWrites=true&w=majority&appName=Cluster0";

async function connectDB() {
  if (cached.conn) return cached.conn;

  const mongoUri = process.env.MONGODB_URI || fallbackMongoUri;

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 20000,
        family: 4,
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  console.log("connected to mongodb");
  return cached.conn;
}

export default connectDB;
