const path = require("path");
// load .env from the server folder (this project keeps env in server/.env)
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
const collabRoutes = require("./routes/collab");
const powerbiRoutes = require("./routes/powerbi");
const profileRoutes = require("./routes/profile");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/repos", repoRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/events", eventRoutes);
app.use("/api/collab", collabRoutes);
app.use("/api/powerbi", powerbiRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", require("./routes/notifications"));

const PORT = process.env.PORT || 5050;
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log("Server running on", PORT));
  })
  .catch((err) => console.log(err));
