
const express = require("express");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const router = express.Router();

function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Admin login required" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function getProjectsCollection(req) {
  return req.app.locals.db.collection("projects");
}

function formatProject(project) {
  return {
    ...project,
    id: project._id.toString(),
    title: project.name,
  };
}

function validateProject(body) {
  const name = String(body.name || body.title || "").trim();
  const description = String(body.description || "").trim();
  const location = String(body.location || "").trim();
  const status = body.status || "Planned";
  const progress = Number(body.progress ?? 0);

  if (!name || !description || !location) {
    return { error: "Project name, description, and location are required" };
  }

  if (!["Planned", "In Progress", "Completed", "Delayed"].includes(status)) {
    return { error: "Invalid project status" };
  }

  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    return { error: "Progress must be between 0 and 100" };
  }

  const startDate = body.startDate ? new Date(body.startDate) : null;
  const endDate = body.endDate ? new Date(body.endDate) : null;

  if (startDate && Number.isNaN(startDate.getTime())) {
    return { error: "Invalid start date" };
  }

  if (endDate && Number.isNaN(endDate.getTime())) {
    return { error: "Invalid end date" };
  }

  if (status === "Completed" && progress !== 100) {
    return { error: "Completed projects must have 100% progress" };
  }

  return {
    value: {
      name,
      description,
      location,
      startDate,
      endDate,
      progress,
      status,
      updatedAt: new Date(),
    },
  };
}

// Villagers and admins can view all projects.

router.get("/", async (req, res) => {
  try {
    const db = req.app.locals.db;

    if (!db) {
      console.error("Project API: MongoDB database is not attached to Express.");
      return res.status(500).json({
        message: "Database connection is not configured",
      });
    }

    const projects = await db
      .collection("projects")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(projects.map(formatProject));
  } catch (error) {
    console.error("GET /api/projects error:", error);
    res.status(500).json({
      message: "Failed to load projects",
      error: error.message,
    });
  }
});


// Admin can add a project.
router.post("/", requireAdmin, async (req, res) => {
  try {
    const result = validateProject(req.body);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    const project = {
      ...result.value,
      createdAt: new Date(),
    };

    const collection = getProjectsCollection(req);
    const insertResult = await collection.insertOne(project);
    const savedProject = await collection.findOne({
      _id: insertResult.insertedId,
    });

    res.status(201).json(formatProject(savedProject));
  } catch (error) {
    res.status(500).json({ message: "Failed to add project" });
  }
});

// Admin can edit a project.
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const result = validateProject(req.body);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    const collection = getProjectsCollection(req);
    const projectId = new ObjectId(req.params.id);

    const updateResult = await collection.updateOne(
      { _id: projectId },
      { $set: result.value }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const updatedProject = await collection.findOne({ _id: projectId });

    res.json(formatProject(updatedProject));
  } catch (error) {
    res.status(500).json({ message: "Failed to update project" });
  }
});

// Admin can delete a project.
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const result = await getProjectsCollection(req).deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete project" });
  }
});

module.exports = router;
