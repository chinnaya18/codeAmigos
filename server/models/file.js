const FileSchema = new mongoose.Schema({
  repoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Repo",
    required: true,
  },
  name: { type: String, required: true },
  content: { type: String, default: "" },
});

module.exports = mongoose.models.File || mongoose.model("File", FileSchema);
