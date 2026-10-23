
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const schemeRoutes = require("./schemeRoutes");
const authRoutes = require("./authRoutes");
const noticeRoutes = require("./noticeRoutes");
const complaintRoutes = require("./complaintRoutes");
const projectRoutes = require("./projectRoutes");
const connectDB = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/schemes", schemeRoutes);
app.get("/", (req, res) => {
  res.send("GramVikas Backend is running!");
});
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "GramVikas Backend is running!",
  });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then((db) => {
    app.locals.db = db;

    app.listen(PORT, () => {
      console.log("MongoDB Connected Successfully!");
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Server startup failed:", error.message);
  });
