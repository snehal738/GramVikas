const verifyAdmin = require("./authMiddleware");
const { ObjectId } = require("mongodb");
const express = require("express");
const router = express.Router();
const connectDB = require("./db");

// Submit a complaint
router.post("/", async (req, res) => {
  try {
    const db = await connectDB();

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const complaint = {
      title,
      description,
      status: "Pending",
      createdAt: new Date(),
    };

    const result = await db
      .collection("complaints")
      .insertOne(complaint);

    res.status(201).json({
      message: "Complaint submitted successfully",
      id: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all complaints
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();

    const complaints = await db
      .collection("complaints")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Update complaint status (Admin Panel)
router.patch("/:id/status", verifyAdmin, async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "In Progress", "Resolved"];

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await db.collection("complaints").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: status } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ message: "Complaint status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
