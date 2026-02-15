// routes/profile.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const Repository = require("../models/Repository");
const User = require("../models/user");
const cloudinary = require("../services/Cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

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

/* -------- UPDATE PROFILE -------- */
router.put("/", auth, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (username && username !== user.username) {
      const taken = await User.findOne({ username });
      if (taken) return res.status(409).json({ msg: "Username already taken" });
      user.username = username;
    }
    if (email && email !== user.email) {
      const taken = await User.findOne({ email });
      if (taken) return res.status(409).json({ msg: "Email already in use" });
      user.email = email;
    }

    await user.save();
    res.json({ username: user.username, email: user.email });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* -------- AVATAR UPLOAD -------- */
router.post("/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "avatars",
            public_id: `user_${req.user._id}`,
            overwrite: true,
            resource_type: "image",
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          },
        )
        .end(req.file.buffer);
    });

    // Update user avatar in DB
    await User.findByIdAndUpdate(req.user._id, { avatar: result.secure_url });

    res.json({ url: result.secure_url, msg: "Avatar updated" });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ msg: "Avatar upload failed" });
  }
});

router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const ownedRepos = await Repository.countDocuments({ owner: userId });
    const collabRepos = await Repository.countDocuments({
      collaborators: userId,
    });

    const userRepos = await Repository.find({
      $or: [{ owner: userId }, { collaborators: userId }],
    }).select("files views createdAt commits");

    let totalFiles = 0;
    let totalViews = 0;
    const filesModifiedByUser = [];

    for (const repo of userRepos) {
      totalViews += repo.views || 0;
      for (const file of repo.files || []) {
        totalFiles++;
        if (
          file.modifiedBy &&
          file.modifiedBy.toString() === userId.toString()
        ) {
          filesModifiedByUser.push({
            date: file.lastModified,
            version: file.version,
          });
        }
      }
    }

    // Build contribution heatmap
    const today = new Date();
    const dayMap = {};

    for (const f of filesModifiedByUser) {
      if (f.date) {
        const key = new Date(f.date).toISOString().split("T")[0];
        dayMap[key] = (dayMap[key] || 0) + (f.version || 1);
      }
    }

    // Include commits in heatmap
    for (const repo of userRepos) {
      for (const commit of repo.commits || []) {
        if (
          commit.author &&
          commit.author.toString() === userId.toString() &&
          commit.createdAt
        ) {
          const key = new Date(commit.createdAt).toISOString().split("T")[0];
          dayMap[key] = (dayMap[key] || 0) + 1;
        }
      }
    }

    for (const repo of userRepos) {
      if (repo.createdAt) {
        const key = new Date(repo.createdAt).toISOString().split("T")[0];
        dayMap[key] = (dayMap[key] || 0) + 1;
      }
    }

    // Return heatmap as object (key-value pairs) for client
    const heatmap = dayMap;

    // Calculate streaks from 365-day timeline
    const days = [];
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().split("T")[0];
      days.push({ date: key, count: dayMap[key] || 0 });
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (const day of days) {
      if (day.count > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) currentStreak++;
      else break;
    }

    // Language distribution
    const languageMap = {};
    for (const repo of userRepos) {
      for (const file of repo.files || []) {
        const ext = (file.name || "").split(".").pop().toLowerCase();
        const lang = extToLang(ext);
        languageMap[lang] = (languageMap[lang] || 0) + 1;
      }
    }

    const languages = Object.entries(languageMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Monthly activity (last 12 months)
    const monthlyActivity = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      let count = 0;
      for (const day of days) {
        if (day.date.startsWith(monthKey)) count += day.count;
      }
      monthlyActivity.push({ month: label, count });
    }

    res.json({
      repos: ownedRepos,
      collabRepos,
      totalFiles,
      totalViews,
      filesModified: filesModifiedByUser.length,
      heatmap,
      streaks: { currentStreak, longestStreak },
      languages,
      monthlyActivity,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

function extToLang(ext) {
  const map = {
    js: "JavaScript",
    jsx: "JavaScript",
    ts: "TypeScript",
    tsx: "TypeScript",
    py: "Python",
    java: "Java",
    c: "C",
    cpp: "C++",
    cs: "C#",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    json: "JSON",
    md: "Markdown",
    txt: "Text",
    rb: "Ruby",
    go: "Go",
    rs: "Rust",
    php: "PHP",
    sql: "SQL",
    sh: "Shell",
    yml: "YAML",
    yaml: "YAML",
    xml: "XML",
    svg: "SVG",
  };
  return map[ext] || "Other";
}

module.exports = router;
