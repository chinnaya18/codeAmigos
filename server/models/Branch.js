const BranchSchema = new mongoose.Schema({
  repoId: mongoose.ObjectId,
  name: String,
  head: mongoose.ObjectId, // commitId
});
module.exports = mongoose.model("Branch", BranchSchema);
