const router = require("express").Router();
const auth = require("../middleware/auth");
const Notification = require("../models/Notification");

router.get("/", auth, async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ notifications: notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
