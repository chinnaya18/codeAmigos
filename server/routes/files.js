const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const Repository = require("../models/Repository");
const cloudinary = require("../services/Cloudinary");

/* ----------------------------------
   MULTER MEMORY STORAGE
----------------------------------- */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

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

      if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

      const buffer = req.file.buffer;
      const filename = req.file.originalname;

      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            folder: `repos/${repo._id}`,
            public_id: `${Date.now()}_${filename}`,
          },
          async (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              return res.status(500).json({ msg: "Cloudinary upload failed" });
            }

            const newFile = {
              name: filename,
              cloudinaryPublicId: result.public_id,
              cloudinaryUrl: result.secure_url,
              version: 1,
              lastModified: new Date(),
              modifiedBy: req.user._id,
            };

            repo.files.push(newFile);
            await repo.save();

            res.json({ msg: "File uploaded", file: newFile });
          }
        )
        .end(buffer);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

/* ----------------------------------
   LIST FILES (MAIN FIX)
----------------------------------- */
router.get("/:repoId/list", auth, async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ msg: "Repo not found" });

    return res.json(repo.files); // MUST return array
  } catch (err) {
    console.error("LIST FILES ERROR:", err);
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

    return res.json({
      cloudinaryUrl: file.cloudinaryUrl,
      metadata: file,
    });
  } catch (err) {
    console.error("GET FILE ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ----------------------------------
   UPDATE FILE VERSION
----------------------------------- */
router.put(
  "/:repoId/file/:fileId",
  auth,
  upload.single("file"),
  async (req, res) => {
    try {
      const repo = await Repository.findById(req.params.repoId);
      if (!repo) return res.status(404).json({ msg: "Repo not found" });

      const file = repo.files.id(req.params.fileId);
      if (!file) return res.status(404).json({ msg: "File not found" });

      if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            folder: `repos/${repo._id}`,
            public_id: `${Date.now()}_${file.name}`,
          },
          async (error, result) => {
            if (error) {
              console.error("Cloudinary Update Error:", error);
              return res.status(500).json({ msg: "Cloudinary upload failed" });
            }

            file.cloudinaryUrl = result.secure_url;
            file.cloudinaryPublicId = result.public_id;
            file.version += 1;
            file.lastModified = new Date();
            file.modifiedBy = req.user._id;

            await repo.save();
            return res.json({ msg: "File updated", file });
          }
        )
        .end(req.file.buffer);
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
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

    await cloudinary.uploader.destroy(file.cloudinaryPublicId, {
      resource_type: "raw",
    });

    file.deleteOne();
    await repo.save();

    res.json({ msg: "File deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
