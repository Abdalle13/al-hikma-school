import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

// safe seeder. run with:
//   npm run data:import    add demo data
//   npm run data:destroy   remove demo data
// the real seed and destroy logic is built in backend phase b11.

const destroy = process.argv.includes("-d");

async function run() {
  await connectDB();

  if (destroy) {
    console.log("nothing to destroy yet (phase b11)");
  } else {
    console.log("nothing to seed yet (phase b11)");
  }

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
