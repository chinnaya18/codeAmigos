// routes/repo.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Repository = require("../models/Repository");

// ---------------------------------------------
// CREATE REPO
// ---------------------------------------------
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
    });

    await repo.save();

    return res.json({
      msg: "Repository created successfully.",
      repo,
    });
  } catch (err) {
    console.error("Repo Creation Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------------------------------------
// GET ALL REPOS FOR LOGGED-IN USER
// ---------------------------------------------
router.get("/myrepos", auth, async (req, res) => {
  try {
    const repos = await Repository.find({ owner: req.user._id });

    return res.json({
      msg: "Repositories fetched.",
      repos,
    });
  } catch (err) {
    console.error("Fetch repos error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
// ---------------------------------------------
// GET POPULAR REPOS (must be BEFORE :repoId !!)
// ---------------------------------------------
router.get("/popular/all", async (req, res) => {
  try {
    const repos = await Repository.find().sort({ views: -1 }).limit(20);
    res.json(repos);
  } catch (err) {
    console.error("Popular repo error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------------------------------------
// GET SINGLE REPO
// ---------------------------------------------
router.get("/:repoId", auth, async (req, res) => {
  try {
    const repo = await Repository.findOne({
      _id: req.params.repoId,
      owner: req.user._id,
    });

    if (!repo) return res.status(404).json({ msg: "Repo not found" });

    return res.json(repo);
  } catch (err) {
    console.error("Fetch repo error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
