const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const Repository = require("../models/Repository");
const cloudinary = require("../services/Cloudinary");

/* MULTER MEMORY STORAGE */
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

/* ----------------------------------
   UPLOAD FILE
----------------------------------- */
router.post(
  "/:repoId/upload",
  auth,
  upload.single("file"),
  async (req, res) => {
    try {
      const repo = await Repository.findById(req.params.repoId);
      if (!repo) return res.status(404).json({ msg: "Repo not found" });

      // Check permission
      const isOwner = repo.owner.toString() === req.user._id.toString();
      const isCollab = (repo.collaborators || []).some(
        (c) => c.toString() === req.user._id.toString(),
      );
      if (!isOwner && !isCollab) {
        return res.status(403).json({ msg: "Access denied" });
      }

      if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

      // Handle empty files – Cloudinary rejects 0-byte uploads
      const fileBuffer =
        req.file.buffer.length > 0 ? req.file.buffer : Buffer.from(" ");
      const commitMessage =
        req.body.commitMessage || `Add ${req.file.originalname}`;

      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            folder: `repos/${repo._id}`,
            public_id: `${Date.now()}_${req.file.originalname}`,
          },
          async (error, result) => {
            if (error)
              return res.status(500).json({ msg: "Cloudinary upload failed" });

            const newFile = {
              name: req.file.originalname,
              cloudinaryPublicId: result.public_id,
              cloudinaryUrl: result.secure_url,
              version: 1,
              lastModified: new Date(),
              modifiedBy: req.user._id,
            };

            repo.files.push(newFile);

            // Add commit
            repo.commits.push({
              message: commitMessage,
              author: req.user._id,
              files: [{ name: req.file.originalname, action: "added" }],
            });

            await repo.save();

            res.json({ msg: "File uploaded", file: newFile });
          },
        )
        .end(fileBuffer);
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  },
);

/* ----------------------------------
   LIST FILES
----------------------------------- */
router.get("/:repoId/list", auth, async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ msg: "Repo not found" });

    return res.json(repo.files);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* ----------------------------------
   ALIAS ROUTE
----------------------------------- */
router.get("/:repoId", auth, async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ msg: "Repo not found" });

    return res.json(repo.files || []);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* ----------------------------------
   GET SINGLE FILE
----------------------------------- */
router.get("/:repoId/file/:fileId", auth, async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ msg: "Repo not found" });

    const file = repo.files.id(req.params.fileId);
    if (!file) return res.status(404).json({ msg: "File not found" });

    res.json({ cloudinaryUrl: file.cloudinaryUrl, metadata: file });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* ----------------------------------
   UPDATE FILE
----------------------------------- */
router.put(
  "/:repoId/file/:fileId",
  auth,
  upload.single("file"),
  async (req, res) => {
    try {
      const repo = await Repository.findById(req.params.repoId);
      if (!repo) return res.status(404).json({ msg: "Repo not found" });

      // Check permission
      const isOwner = repo.owner.toString() === req.user._id.toString();
      const isCollab = (repo.collaborators || []).some(
        (c) => c.toString() === req.user._id.toString(),
      );
      if (!isOwner && !isCollab) {
        return res.status(403).json({ msg: "Access denied" });
      }

      const file = repo.files.id(req.params.fileId);
      if (!file) return res.status(404).json({ msg: "File not found" });

      const commitMessage = req.body.commitMessage || `Update ${file.name}`;

      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            folder: `repos/${repo._id}`,
            public_id: `${Date.now()}_${file.name}`,
          },
          async (err, result) => {
            if (err) return res.status(500).json({ msg: "Upload failed" });

            file.cloudinaryUrl = result.secure_url;
            file.version++;
            file.lastModified = new Date();
            file.modifiedBy = req.user._id;

            // Add commit
            repo.commits.push({
              message: commitMessage,
              author: req.user._id,
              files: [{ name: file.name, action: "modified" }],
            });

            await repo.save();
            res.json({ msg: "File updated", file });
          },
        )
        .end(req.file.buffer);
    } catch (err) {
      console.error("Update file error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  },
);

/* ----------------------------------
   DELETE FILE
----------------------------------- */
router.delete("/:repoId/file/:fileId", auth, async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ msg: "Repo not found" });

    const file = repo.files.id(req.params.fileId);
    if (!file) return res.status(404).json({ msg: "File not found" });

    const fileName = file.name;

    await cloudinary.uploader.destroy(file.cloudinaryPublicId, {
      resource_type: "raw",
    });

    file.deleteOne();

    // Add commit
    repo.commits.push({
      message: `Delete ${fileName}`,
      author: req.user._id,
      files: [{ name: fileName, action: "deleted" }],
    });

    await repo.save();

    res.json({ msg: "File deleted" });
  } catch (err) {
    console.error("Delete file error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
