import app from "../app.js";
import connectDB from "../src/config/db.js";

// vercel serverless handler. connect (or reuse) the db on every invocation,
// then hand the request to the express app.
export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
  return app(req, res);
}
