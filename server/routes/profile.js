const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const upload = require("../utils/multer"); // your multer config

router.post("/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    const filePath = `/uploads/${req.file.filename}`;

    req.user.avatar = filePath;
    await req.user.save();

    res.json({ msg: "Avatar updated", avatar: filePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
