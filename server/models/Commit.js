const mongoose = require("mongoose");
const CommitSchema = new mongoose.Schema({
  repoId: { type: mongoose.ObjectId, required: true },
  parentIds: [mongoose.ObjectId],
  author: { id: mongoose.ObjectId, username: String },
  message: String,
  timestamp: { type: Date, default: Date.now },
  files: [
    {
      path: String,
      cloudinaryPublicId: String,
      cloudinaryUrl: String,
      version: Number,
    },
  ],
});
module.exports = mongoose.model("Commit", CommitSchema);
