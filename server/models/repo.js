const mongoose = require("mongoose");

const RepoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  visibility: { type: String, enum: ["public", "private"], default: "public" },
  description: String,

  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  files: [
    {
      name: String,
      content: String,
      cloudinary_url: String,
    },
  ],
});

module.exports = mongoose.model("Repository", RepoSchema);
