const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const User = require("../models/user");
const Notification = require("../models/Notification");

// CREATE EVENT + notify all users
router.post("/events", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();

    const users = await User.find({});
    const notifs = users.map((u) => ({
      user: u._id,
      type: "event",
      message: `New Event Posted: ${event.title}`,
    }));
    await Notification.insertMany(notifs);

    res.json({ msg: "Event created", event });
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET ALL EVENTS
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE EVENT
router.delete("/events/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ msg: "Event removed" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// GET ALL USERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-passwordHash");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE USER
router.delete("/user/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User removed" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
