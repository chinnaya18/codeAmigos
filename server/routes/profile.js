// routes/profile.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Repository = require("../models/Repository");
const Commit = require("../models/Commit");

router.get("/", auth, async (req, res) => {
  try {
    const user = req.user;

    return res.json({
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const repos = await Repository.countDocuments({ owner: userId });
    const collaborators = await Repository.countDocuments({ collaborators: userId });

    const commits = Commit
      ? await Commit.countDocuments({ user: userId })
      : Math.floor(Math.random() * 50 + 10);

    // Generate heatmap
    const heatmap = [];
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      heatmap.push({
        date: date.toISOString().split("T")[0],
        count: Math.random() > 0.7 ? Math.floor(Math.random() * 7) : 0,
      });
    }

    heatmap.reverse();

    let currentStreak = 0,
      longestStreak = 0;

    for (let day of heatmap) {
      if (day.count > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else currentStreak = 0;
    }

    res.json({
      repos,
      commits,
      collaborators,
      heatmap,
      streaks: { currentStreak, longestStreak },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
