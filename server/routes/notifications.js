// routes/notifications.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const Notification = require("../models/Notification");

// Get all notifications for current user
router.get("/", auth, async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
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
      { read: true }
    );
    res.json({ msg: "Notification marked as read." });
  } catch (err) {
    console.error("Notification read error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
