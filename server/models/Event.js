const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Event", EventSchema);
