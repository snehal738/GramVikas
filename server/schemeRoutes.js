
const express = require("express");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const router = express.Router();

// Verify that the user is an admin
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please log in as admin",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

// Public: View all government schemes
router.get("/", async (req, res) => {
  try {
    const db = req.app.locals.db;

    if (!db) {
      return res.status(500).json({
        message: "Database is not connected",
      });
    }

    const schemes = await db
      .collection("schemes")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(schemes);
  } catch (error) {
    console.error("Load schemes error:", error);
    res.status(500).json({
      message: "Failed to load government schemes",
    });
  }
});

// Admin: Add a government scheme
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const {
      schemeName,
      description,
      eligibility,
      benefits,
      requiredDocuments,
      applicationLink,
      department,
      status,
    } = req.body;

    if (!schemeName?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Scheme name and description are required",
      });
    }

    const scheme = {
      schemeName: schemeName.trim(),
      description: description.trim(),
      eligibility: eligibility || "",
      benefits: benefits || "",
      requiredDocuments: requiredDocuments || "",
      applicationLink: applicationLink || "",
      department: department || "",
      status: status === "Closed" ? "Closed" : "Active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await req.app.locals.db
      .collection("schemes")
      .insertOne(scheme);

    res.status(201).json({
      message: "Government scheme added successfully",
      scheme: { ...scheme, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Add scheme error:", error);
    res.status(500).json({
      message: "Failed to add government scheme",
    });
  }
});

// Admin: Edit a government scheme
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid scheme ID" });
    }

    const {
      schemeName,
      description,
      eligibility,
      benefits,
      requiredDocuments,
      applicationLink,
      department,
      status,
    } = req.body;

    if (!schemeName?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Scheme name and description are required",
      });
    }

    const updatedScheme = {
      schemeName: schemeName.trim(),
      description: description.trim(),
      eligibility: eligibility || "",
      benefits: benefits || "",
      requiredDocuments: requiredDocuments || "",
      applicationLink: applicationLink || "",
      department: department || "",
      status: status === "Closed" ? "Closed" : "Active",
      updatedAt: new Date(),
    };

    const result = await req.app.locals.db
      .collection("schemes")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedScheme }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Government scheme not found",
      });
    }

    res.json({
      message: "Government scheme updated successfully",
    });
  } catch (error) {
    console.error("Update scheme error:", error);
    res.status(500).json({
      message: "Failed to update government scheme",
    });
  }
});

// Admin: Delete a government scheme
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid scheme ID" });
    }

    const result = await req.app.locals.db
      .collection("schemes")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Government scheme not found",
      });
    }

    res.json({
      message: "Government scheme deleted successfully",
    });
  } catch (error) {
    console.error("Delete scheme error:", error);
    res.status(500).json({
      message: "Failed to delete government scheme",
    });
  }
});

module.exports = router;
