const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  name: String,
  cloudinaryUrl: String,
  cloudinaryPublicId: String,
  version: { type: Number, default: 1 },
  lastModified: { type: Date, default: Date.now },
  modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const CommitSchema = new mongoose.Schema({
  message: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  files: [{ name: String, action: String }], // action: "added", "modified", "deleted"
  createdAt: { type: Date, default: Date.now },
});

const RepositorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    description: { type: String, default: "" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Pending collaboration invitations
    pendingInvites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Stars (GitHub-like)
    stars: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Fork info
    forkedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      default: null,
    },
    forks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Repository" }],

    // README content (stored as markdown text)
    readme: { type: String, default: "" },

    // Default branch
    defaultBranch: { type: String, default: "main" },

    views: { type: Number, default: 0 },

    files: [FileSchema],
    commits: [CommitSchema],
  },
  { timestamps: true },
);

// Compound index: one repo name per owner
RepositorySchema.index({ name: 1, owner: 1 }, { unique: true });

module.exports =
  mongoose.models.Repository || mongoose.model("Repository", RepositorySchema);
