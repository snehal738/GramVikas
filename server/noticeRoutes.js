
const express = require("express");
const { ObjectId } = require("mongodb");
const verifyAdmin = require("./authMiddleware");
const router = express.Router();
const connectDB = require("./db");

// Admin only: Add a new notice
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const db = await connectDB();
    const { title, description, date } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !date
    ) {
      return res.status(400).json({
        message: "Title, description and date are required",
      });
    }

    const notice = {
      title: title.trim(),
      description: description.trim(),
      date,
      createdAt: new Date(),
    };

    const result = await db.collection("notices").insertOne(notice);

    res.status(201).json({
      message: "Notice published successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Add notice error:", error);
    res.status(500).json({ message: "Failed to publish notice" });
  }
});

// Public: Get all notices
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();

    const notices = await db
      .collection("notices")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json(notices);
  } catch (error) {
    console.error("Get notices error:", error);
    res.status(500).json({ message: "Failed to load notices" });
  }
});

// Admin only: Delete a notice
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid notice ID",
      });
    }

    const db = await connectDB();

    const result = await db.collection("notices").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Notice not found",
      });
    }

    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Delete notice error:", error);
    res.status(500).json({ message: "Failed to delete notice" });
  }
});

module.exports = router;
