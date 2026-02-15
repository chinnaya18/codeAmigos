// routes/notifications.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const Notification = require("../models/Notification");
const Repository = require("../models/Repository");

// Get all notifications for current user
router.get("/", auth, async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("repo", "name")
      .populate("from", "username")
      .lean();

    res.json({ notifications: notes });
  } catch (err) {
    console.error("Notification fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Mark a notification as read
router.patch("/:id/read", auth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
    );
    res.json({ msg: "Notification marked as read." });
  } catch (err) {
    console.error("Notification read error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ----------- ACCEPT COLLABORATION INVITE ----------- */
router.post("/:id/accept", auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
      type: "collab_invite",
      status: "pending",
    });

    if (!notification) {
      return res
        .status(404)
        .json({ msg: "Invitation not found or already handled." });
    }

    const repo = await Repository.findById(notification.repo);
    if (!repo) {
      return res.status(404).json({ msg: "Repository no longer exists." });
    }

    // Add user to collaborators
    if (
      !repo.collaborators.some((c) => c.toString() === req.user._id.toString())
    ) {
      repo.collaborators.push(req.user._id);
    }

    // Remove from pendingInvites
    repo.pendingInvites = (repo.pendingInvites || []).filter(
      (p) => p.toString() !== req.user._id.toString(),
    );
    await repo.save();

    // Update notification status
    notification.status = "accepted";
    notification.read = true;
    await notification.save();

    // Notify the repo owner
    await Notification.create({
      user: repo.owner,
      type: "collab_accepted",
      message: `${req.user.username} accepted your invitation to collaborate on "${repo.name}"`,
      repo: repo._id,
      from: req.user._id,
    });

    res.json({
      msg: "Collaboration accepted! You now have access to this repository.",
    });
  } catch (err) {
    console.error("Accept invite error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ----------- DECLINE COLLABORATION INVITE ----------- */
router.post("/:id/decline", auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
      type: "collab_invite",
      status: "pending",
    });

    if (!notification) {
      return res
        .status(404)
        .json({ msg: "Invitation not found or already handled." });
    }

    const repo = await Repository.findById(notification.repo);

    // Remove from pendingInvites
    if (repo) {
      repo.pendingInvites = (repo.pendingInvites || []).filter(
        (p) => p.toString() !== req.user._id.toString(),
      );
      await repo.save();
    }

    // Update notification status
    notification.status = "declined";
    notification.read = true;
    await notification.save();

    // Notify the repo owner
    if (repo) {
      await Notification.create({
        user: repo.owner,
        type: "collab_declined",
        message: `${req.user.username} declined your invitation to collaborate on "${repo.name}"`,
        repo: repo._id,
        from: req.user._id,
      });
    }

    res.json({ msg: "Invitation declined." });
  } catch (err) {
    console.error("Decline invite error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
