const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: __dirname + "/.env" });
const User = require("./models/user");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo connected");

    // CHANGE THESE IF YOU WANT
    const username = "admin";
    const email = "admin@example.com";
    const password = "admin123";

    const exists = await User.findOne({ email });

    if (exists) {
      console.log("Admin already exists");
      return process.exit();
    }

    const hash = await bcrypt.hash(password, 10);

    const admin = new User({
      username,
      email,
      passwordHash: hash,
      role: "admin",
    });

    await admin.save();

    console.log("Admin created successfully!");
    console.log(`Login Email: ${email}`);
    console.log(`Password : ${password}`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit();
  }
}

createAdmin();
