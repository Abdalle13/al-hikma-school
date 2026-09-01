import app from "./app.js";
import env from "./src/config/env.js";
import connectDB from "./src/config/db.js";

// local development entry point. on vercel this file is not used,
// api/index.js is the serverless handler instead.
async function start() {
  try {
    await connectDB();
    console.log("connected to mongodb");
  } catch (err) {
    console.error("could not connect to mongodb:", err.message);
    // keep the server up so routes still respond with a clear error
  }

  app.listen(env.port, () => {
    console.log(`api running on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

start();
