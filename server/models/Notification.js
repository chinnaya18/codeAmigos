// models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    // recipient of the notification
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // e.g. "event", "collab_added", "info"
    type: { type: String, default: "info" },

    message: { type: String, required: true },

    // optional: which repo this notification is about
    repo: { type: mongoose.Schema.Types.ObjectId, ref: "Repository" },

    // optional: who triggered the notification
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
