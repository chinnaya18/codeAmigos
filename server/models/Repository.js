const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  name: String,
  cloudinaryUrl: String,
  cloudinaryPublicId: String,
  version: { type: Number, default: 1 },
  lastModified: { type: Date, default: Date.now },
  modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const RepositorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  visibility: { type: String, enum: ["public", "private"], default: "public" },
  description: { type: String, default: "" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  files: [FileSchema], // <-- FIXED
});

module.exports =
  mongoose.models.Repository || mongoose.model("Repository", RepositorySchema);
