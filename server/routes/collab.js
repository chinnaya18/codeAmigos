const express = require("express");
const router = express.Router();
const Repository = require("../models/Repository");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

// Request collaboration
router.post("/:repoId/request", auth, async (req, res) => {
  const repo = await Repository.findById(req.params.repoId);
  if (!repo) return res.status(404).json({ msg: "Repo not found" });

  const ownerId = repo.owner;

  // Create notification for owner
  const notif = new Notification({
    user: ownerId,
    type: "collab_request",
    message: `${req.user.username} requested to collaborate on ${repo.name}`,
  });

  await notif.save();

  res.json({ msg: "Collaboration request sent!" });
});

module.exports = router;
