// routes/repos.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const Repository = require("../models/Repository");
const User = require("../models/User");
const Notification = require("../models/Notification");

/* ---------------- CREATE REPO ---------------- */
router.post("/create", auth, async (req, res) => {
  const { name, description, visibility } = req.body;

  if (!name) {
    return res.status(400).json({ msg: "Repository name is required." });
  }

  try {
    const repo = new Repository({
      name,
      description: description || "",
      visibility: visibility || "public",
      owner: req.user._id,
      files: [],
      views: 0,
    });

    await repo.save();
    return res.json({ msg: "Repository created successfully.", repo });
  } catch (err) {
    console.error("Repo Creation Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* -------- USER REPOS: OWNER OR COLLABORATOR -------- */
router.get("/myrepos", auth, async (req, res) => {
  try {
    const repos = await Repository.find({
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .select("_id name visibility views");

    // return plain array to match Home.js handling
    return res.json(repos);
  } catch (err) {
    console.error("Fetch repos error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

/* ---------------- POPULAR REPOS ---------------- */
router.get("/popular/all", async (req, res) => {
  try {
    const repos = await Repository.find()
      .sort({ views: -1 })
      .limit(20)
      .select("_id name visibility views");
    return res.json({ repos });
  } catch (err) {
    console.error("Popular repo error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ---------------- GET SINGLE REPO ---------------- */
router.get("/:repoId", auth, async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId)
      .populate("collaborators", "username email")
      .populate("owner", "_id username email");

    if (!repo) return res.status(404).json({ msg: "Repository not found" });

    const ownerId = repo.owner._id || repo.owner;
    const isOwner = ownerId.toString() === req.user._id.toString();
    const isCollaborator = (repo.collaborators || []).some(
      (c) => c._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator && repo.visibility !== "public") {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Count views for non-owner visits
    if (!isOwner) {
      repo.views = (repo.views || 0) + 1;
      await repo.save();
    }

    // expose owner id directly for client checks
    const json = repo.toObject();
    json.owner = ownerId;

    res.json(json);
  } catch (err) {
    console.error("Repo fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ----------- ADD COLLABORATOR (DIRECT ADD) ------------ */
/*
  body: { collaborator: "usernameOrEmail" }
*/
// ---------------- ADD COLLABORATOR ----------------
router.post("/:repoId/collaborators/add", auth, async (req, res) => {
  try {
    const { collaborator } = req.body;

    if (!collaborator) {
      return res.status(400).json({ msg: "Username or email is required." });
    }

    const repo = await Repository.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ msg: "Repository not found." });

    // Only repo owner can add collaborators
    if (repo.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ msg: "Only the repository owner can add collaborators." });
    }

    // Check user exists
    const User = require("../models/User");
    const foundUser = await User.findOne({
      $or: [{ username: collaborator }, { email: collaborator }],
    });

    if (!foundUser) return res.status(404).json({ msg: "User not found." });

    // Prevent adding yourself
    if (foundUser._id.toString() === repo.owner.toString()) {
      return res.status(400).json({ msg: "You are already the owner." });
    }

    // Prevent duplicate
    if (repo.collaborators.includes(foundUser._id)) {
      return res.status(400).json({ msg: "User is already a collaborator." });
    }

    // Add collaborator
    repo.collaborators.push(foundUser._id);
    await repo.save();

    // Send notification
    const Notification = require("../models/Notification");
    await Notification.create({
      user: foundUser._id,
      type: "collaboration",
      message: `You have been added as a collaborator to ${repo.name}`,
    });

    return res.json({ msg: "Collaborator added successfully." });
  } catch (err) {
    console.error("Add collaborator error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

/* ----------- REMOVE COLLABORATOR ------------ */
router.delete("/:repoId/collaborators/:userId", auth, async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ msg: "Repository not found." });

    if (repo.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ msg: "Only the repository owner can remove collaborators." });
    }

    repo.collaborators = (repo.collaborators || []).filter(
      (id) => id.toString() !== req.params.userId.toString()
    );
    await repo.save();

    res.json({ msg: "Collaborator removed." });
  } catch (err) {
    console.error("Remove collaborator error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
