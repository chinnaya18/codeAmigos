const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const User = require("../models/user");
const Notification = require("../models/Notification");

// CREATE EVENT
router.post("/events", async (req, res) => {
  const event = new Event(req.body);
  await event.save();

  // Send notification to all users
  const users = await User.find({});

  const notifs = users.map((u) => ({
    user: u._id,
    type: "event",
    message: `New Event Posted: ${event.title}`,
  }));

  await Notification.insertMany(notifs);

  res.json({ msg: "Event created", event });
});

// ----- GET ALL EVENTS -----
router.get("/events", async (req, res) => {
  const events = await Event.find({});
  res.json(events);
});

// ----- CREATE EVENT -----
router.post("/events", async (req, res) => {
  const event = new Event(req.body);
  await event.save();
  res.json({ msg: "Event created", event });
});

// ----- DELETE EVENT -----
router.delete("/events/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ msg: "Event removed" });
});

// ----- GET ALL USERS -----
router.get("/users", async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// ----- DELETE USER -----
router.delete("/user/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: "User removed" });
});

module.exports = router;
