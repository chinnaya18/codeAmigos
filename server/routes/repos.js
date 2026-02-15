// routes/repos.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const Repository = require("../models/Repository");
const User = require("../models/user");
const Notification = require("../models/Notification");

/* ---------------- CREATE REPO ---------------- */
router.post("/create", auth, async (req, res) => {
  const { name, description, visibility, readme } = req.body;

  if (!name) {
    return res.status(400).json({ msg: "Repository name is required." });
  }

  try {
    const existing = await Repository.findOne({
      name: name.trim(),
      owner: req.user._id,
    });
    if (existing) {
      return res
        .status(409)
        .json({ msg: "You already have a repository with this name." });
    }

    const repo = new Repository({
      name: name.trim(),
      description: description || "",
      visibility: visibility || "public",
      owner: req.user._id,
      readme: readme || "",
      files: [],
      views: 0,
      commits: [
        {
          message: "Initial commit",
          author: req.user._id,
          files: [],
        },
      ],
    });

    await repo.save();
    return res.json({ msg: "Repository created successfully.", repo });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ msg: "You already have a repository with this name." });
    }
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
      .populate("owner", "username avatar")
      .select(
        "_id name visibility views owner description stars forkedFrom createdAt",
      );

    return res.json(repos);
  } catch (err) {
    console.error("Fetch repos error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

/* ---------------- EXPLORE: ALL PUBLIC REPOS ---------------- */
router.get("/explore", async (req, res) => {
  try {
    const { q, sort } = req.query;
    const filter = { visibility: "public" };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "stars") sortOption = { "stars.length": -1 };
    if (sort === "views") sortOption = { views: -1 };
    if (sort === "name") sortOption = { name: 1 };

    const repos = await Repository.find(filter)
      .sort(sortOption)
      .limit(50)
      .populate("owner", "username avatar")
      .select(
        "_id name visibility views owner description stars forkedFrom createdAt files",
      );

    return res.json({ repos });
  } catch (err) {
    console.error("Explore error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ---------------- POPULAR REPOS ---------------- */
router.get("/popular/all", async (req, res) => {
  try {
    const repos = await Repository.find({
      views: { $gt: 0 },
      visibility: "public",
    })
      .sort({ views: -1 })
      .limit(10)
      .populate("owner", "username avatar")
      .select("_id name visibility views owner stars");
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
      .populate("collaborators", "username email avatar")
      .populate("owner", "_id username email avatar")
      .populate("pendingInvites", "username email")
      .populate("commits.author", "username avatar")
      .populate("forkedFrom", "name owner");

    if (!repo) return res.status(404).json({ msg: "Repository not found" });

    const ownerId = repo.owner._id || repo.owner;
    const isOwner = ownerId.toString() === req.user._id.toString();
    const isCollaborator = (repo.collaborators || []).some(
      (c) => c._id.toString() === req.user._id.toString(),
    );

    if (!isOwner && !isCollaborator && repo.visibility !== "public") {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Count views for non-owner visits
    if (!isOwner) {
      repo.views = (repo.views || 0) + 1;
      await repo.save();
    }

    const json = repo.toObject();
    json.isOwner = isOwner;
    json.isCollaborator = isCollaborator;
    json.starCount = (repo.stars || []).length;
    json.isStarred = (repo.stars || []).some(
      (s) => s.toString() === req.user._id.toString(),
    );
    json.forkCount = (repo.forks || []).length;

    res.json(json);
  } catch (err) {
    console.error("Repo fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ---------------- UPDATE REPO ---------------- */
router.put("/:repoId", auth, async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ msg: "Repository not found" });

    if (repo.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ msg: "Only the owner can update this repository." });
    }

    const { description, visibility, readme } = req.body;
    if (description !== undefined) repo.description = description;
    if (visibility !== undefined) repo.visibility = visibility;
    if (readme !== undefined) repo.readme = readme;

    await repo.save();
    res.json({ msg: "Repository updated.", repo });
  } catch (err) {
    console.error("Update repo error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ---------------- DELETE REPO ---------------- */
router.delete("/:repoId", auth, async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ msg: "Repository not found" });

    if (repo.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ msg: "Only the owner can delete this repository." });
    }

    await Repository.findByIdAndDelete(req.params.repoId);
    res.json({ msg: "Repository deleted." });
  } catch (err) {
    console.error("Delete repo error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ---------------- STAR / UNSTAR REPO ---------------- */
router.post("/:repoId/star", auth, async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ msg: "Repository not found" });

    const userId = req.user._id.toString();
    const isStarred = (repo.stars || []).some((s) => s.toString() === userId);

    if (isStarred) {
      repo.stars = repo.stars.filter((s) => s.toString() !== userId);
      await repo.save();
      return res.json({
        msg: "Unstarred",
        starred: false,
        starCount: repo.stars.length,
      });
    } else {
      repo.stars.push(req.user._id);
      await repo.save();
      return res.json({
        msg: "Starred",
        starred: true,
        starCount: repo.stars.length,
      });
    }
  } catch (err) {
    console.error("Star error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ---------------- FORK REPO ---------------- */
router.post("/:repoId/fork", auth, async (req, res) => {
  try {
    const original = await Repository.findById(req.params.repoId);
    if (!original) return res.status(404).json({ msg: "Repository not found" });

    const existing = await Repository.findOne({
      forkedFrom: original._id,
      owner: req.user._id,
    });
    if (existing) {
      return res
        .status(400)
        .json({ msg: "You already forked this repository.", repo: existing });
    }

    const forkedRepo = new Repository({
      name: original.name,
      description: `Forked from ${original.name}`,
      visibility: "public",
      owner: req.user._id,
      forkedFrom: original._id,
      readme: original.readme,
      files: original.files.map((f) => ({
        name: f.name,
        cloudinaryUrl: f.cloudinaryUrl,
        cloudinaryPublicId: f.cloudinaryPublicId,
        version: 1,
        lastModified: new Date(),
        modifiedBy: req.user._id,
      })),
      commits: [
        {
          message: `Forked from ${original.name}`,
          author: req.user._id,
          files: original.files.map((f) => ({ name: f.name, action: "added" })),
        },
      ],
    });

    await forkedRepo.save();

    original.forks.push(forkedRepo._id);
    await original.save();

    res.json({ msg: "Repository forked!", repo: forkedRepo });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ msg: "You already have a repository with this name." });
    }
    console.error("Fork error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ----------- INVITE COLLABORATOR ------------ */
router.post("/:repoId/collaborators/add", auth, async (req, res) => {
  try {
    const { collaborator } = req.body;

    if (!collaborator) {
      return res.status(400).json({ msg: "Username or email is required." });
    }

    const repo = await Repository.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ msg: "Repository not found." });

    if (repo.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ msg: "Only the repository owner can invite collaborators." });
    }

    const foundUser = await User.findOne({
      $or: [{ username: collaborator }, { email: collaborator }],
    });

    if (!foundUser) return res.status(404).json({ msg: "User not found." });

    if (foundUser._id.toString() === repo.owner.toString()) {
      return res.status(400).json({ msg: "You are already the owner." });
    }

    if (
      repo.collaborators.some((c) => c.toString() === foundUser._id.toString())
    ) {
      return res.status(400).json({ msg: "User is already a collaborator." });
    }

    if (
      (repo.pendingInvites || []).some(
        (p) => p.toString() === foundUser._id.toString(),
      )
    ) {
      return res
        .status(400)
        .json({ msg: "Invitation already sent to this user." });
    }

    repo.pendingInvites = repo.pendingInvites || [];
    repo.pendingInvites.push(foundUser._id);
    await repo.save();

    await Notification.create({
      user: foundUser._id,
      type: "collab_invite",
      message: `${req.user.username} invited you to collaborate on "${repo.name}"`,
      repo: repo._id,
      from: req.user._id,
      status: "pending",
    });

    return res.json({ msg: "Invitation sent successfully." });
  } catch (err) {
    console.error("Invite collaborator error:", err);
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
      (id) => id.toString() !== req.params.userId.toString(),
    );
    await repo.save();

    res.json({ msg: "Collaborator removed." });
  } catch (err) {
    console.error("Remove collaborator error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ----------- GET COMMITS ------------ */
router.get("/:repoId/commits", auth, async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId)
      .populate("commits.author", "username avatar")
      .select("commits");

    if (!repo) return res.status(404).json({ msg: "Repository not found" });

    const commits = (repo.commits || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.json({ commits });
  } catch (err) {
    console.error("Get commits error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
