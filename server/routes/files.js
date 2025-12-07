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
      if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

      const fileBuffer = req.file.buffer;

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
            await repo.save();

            res.json({ msg: "File uploaded", file: newFile });
          }
        )
        .end(fileBuffer);
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  }
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
   ALIAS ROUTE (Fix for frontend)
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
  const repo = await Repository.findById(req.params.repoId);
  if (!repo) return res.status(404).json({ msg: "Repo not found" });

  const file = repo.files.id(req.params.fileId);
  if (!file) return res.status(404).json({ msg: "File not found" });

  res.json({ cloudinaryUrl: file.cloudinaryUrl, metadata: file });
});

/* ----------------------------------
   UPDATE FILE
----------------------------------- */
router.put(
  "/:repoId/file/:fileId",
  auth,
  upload.single("file"),
  async (req, res) => {
    const repo = await Repository.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ msg: "Repo not found" });

    const file = repo.files.id(req.params.fileId);
    if (!file) return res.status(404).json({ msg: "File not found" });

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

          await repo.save();
          res.json({ msg: "File updated", file });
        }
      )
      .end(req.file.buffer);
  }
);

/* ----------------------------------
   DELETE FILE
----------------------------------- */
router.delete("/:repoId/file/:fileId", auth, async (req, res) => {
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
});

module.exports = router;
