const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String, // "event", "collab_request"
  message: String,
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

module.exports = mongoose.model("Notification", NotificationSchema);
