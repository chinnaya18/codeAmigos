const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, // FIXED
  role: { type: String, default: "user" },
  avatar: { type: String, default: "" },
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
