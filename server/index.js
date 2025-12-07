// index.js (server entry)
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const repoRoutes = require("./routes/repos");
const fileRoutes = require("./routes/files");
const adminRoutes = require("./routes/admin");
const notifRoutes = require("./routes/notifications");
const eventRoutes = require("./routes/events");
const collabRoutes = require("./routes/collab"); // currently unused helper
const powerbiRoutes = require("./routes/powerbi");
const profileRoutes = require("./routes/profile");

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());

// To serve uploaded avatars, etc.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* --------- ROUTES --------- */
app.use("/api/auth", authRoutes);
app.use("/api/repos", repoRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/collab", collabRoutes);
app.use("/api/powerbi", powerbiRoutes);
app.use("/profile", profileRoutes);
app.use("/api/notifications", notifRoutes);

const PORT = process.env.PORT || 5050;

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log("Server running on", PORT));
  })
  .catch((err) => console.log(err));
