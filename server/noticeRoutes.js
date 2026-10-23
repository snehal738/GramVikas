
const express = require("express");
const router = express.Router();
const connectDB = require("./db");

// Add a new notice
router.post("/", async (req, res) => {
  try {
    const db = await connectDB();
    const { title, description, date } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({
        message: "Title, description and date are required",
      });
    }

    const notice = {
      title,
      description,
      date,
      createdAt: new Date(),
    };

    const result = await db.collection("notices").insertOne(notice);

    res.status(201).json({
      message: "Notice published successfully",
      id: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all notices
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
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
