const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// -----------------------------------------
// SIGNUP ROUTE
// -----------------------------------------
router.post("/signup", async (req, res) => {
  try {
    console.log("SIGNUP HIT:", req.body);

    const { username, email, password, role } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ msg: "Missing fields" });

    // Check if user exists
    const exists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (exists) return res.status(400).json({ msg: "User already exists" });

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      passwordHash: hash,
      role: role || "user", // default role
    });

    await user.save();

    // Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// -----------------------------------------
// SIGNIN ROUTE  (FIXED ROLE RETURN)
// -----------------------------------------
router.post("/signin", async (req, res) => {
  const { emailOrUsername, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  });

  if (!user) return res.status(400).json({ msg: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ msg: "Invalid credentials" });

  // Generate token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role, // <-- IMPORTANT FIX!
    },
  });
});

module.exports = router;
