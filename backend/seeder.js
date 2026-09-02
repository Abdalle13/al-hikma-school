import "dotenv/config";
import "colors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/userModel.js";

// safe seeder. run with:
//   npm run data:import    create the first admin account (idempotent)
//   npm run data:destroy   remove that admin account
// classes, terms, students and demo data are seeded in phase b11.

const destroy = process.argv.includes("-d");

const admin = {
  name: process.env.ADMIN_NAME || "School Admin",
  email: (process.env.ADMIN_EMAIL || "admin@school.com").toLowerCase(),
  password: process.env.ADMIN_PASSWORD || "admin123456",
};

async function run() {
  await connectDB();

  if (destroy) {
    const result = await User.deleteOne({ email: admin.email, role: "Admin" });
    console.log(
      result.deletedCount ? `removed admin ${admin.email}`.yellow : "no seeded admin to remove".gray
    );
  } else {
    const existing = await User.findOne({ email: admin.email });
    if (existing) {
      // idempotent and predictable: line the account back up with the env
      // values so the documented login always works.
      existing.name = admin.name;
      existing.role = "Admin";
      existing.status = "Active";
      existing.password = admin.password;
      existing.mustChangePassword = true;
      await existing.save();
      console.log(`admin ${admin.email} reset to the password in .env`.green);
    } else {
      await User.create({
        name: admin.name,
        email: admin.email,
        password: admin.password,
        role: "Admin",
        status: "Active",
        mustChangePassword: true,
      });
      console.log(`created admin ${admin.email} with password "${admin.password}"`.green);
    }
    console.log("change this password after the first login".gray);
  }

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error(String(err.message).red);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
