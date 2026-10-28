
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const connectDB = require("./db");
const verifyAdmin = require("./verifyAdmin");

const router = express.Router();

function normalizeVillage(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

// Public admin registration stays disabled.
router.post("/register", async (req, res) => {
  return res.status(403).json({
    message:
      "Public admin registration is disabled. Contact the system administrator.",
  });
});

// Existing admin login.
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const db = await connectDB();
    const admin = await db.collection("admins").findOne({
      username: username.trim(),
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is not configured",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id.toString(),
        role: "admin",
        village: admin.village,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Login successful",
      token,
      username: admin.username,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Unable to log in" });
  }
});

// Citizen registration.
// Required body: name, username, password, village.
// Optional: mobile, address.
router.post("/citizen/register", async (req, res) => {
  try {
    const { name, username, password, village, mobile, address } = req.body;

    if (
      typeof name !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof village !== "string" ||
      !name.trim() ||
      !username.trim() ||
      !village.trim() ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Name, username, village and a password of at least 8 characters are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is not configured",
      });
    }

    const db = await connectDB();

    // Match the citizen's village against an admin's saved village.
    const admins = await db.collection("admins").find({
      role: "admin",
      village: { $exists: true, $type: "string" },
    }).toArray();

   const matchingAdmin = admins.find(
  (admin) =>
    normalizeVillage(admin.village) === normalizeVillage(village)
);

if (!matchingAdmin) {
  return res.status(403).json({
    message: "Registration is allowed only for your configured village.",
  });
}

    const citizens = db.collection("citizens");
    const existingCitizen = await citizens.findOne({
      username: username.trim(),
    });

    if (existingCitizen) {
      return res.status(409).json({
        message: "This username is already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

   await citizens.insertOne({
  name: name.trim(),
  username: username.trim(),
  password: passwordHash,
  village: matchingAdmin.village,
  mobile: typeof mobile === "string" ? mobile.trim() : "",
  address: typeof address === "string" ? address.trim() : "",
  status: "Approved",
  createdAt: new Date(),
});

   return res.status(201).json({
  message: "Registration successful! You can log in now.",
  status: "Approved",
});
  } catch (error) {
    console.error("Citizen registration error:", error);
    return res.status(500).json({
      message: "Unable to complete registration",
    });
  }
});

// Citizen login: approved accounts only.
router.post("/citizen/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is not configured",
      });
    }

    const db = await connectDB();
    const citizen = await db.collection("citizens").findOne({
      username: username.trim(),
    });

    if (!citizen || !(await bcrypt.compare(password, citizen.password))) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

   if (citizen.status !== "Approved") {
  const admins = await db.collection("admins")
    .find({
      role: "admin",
      village: { $exists: true, $type: "string" },
    })
    .toArray();

  const matchingAdmin = admins.find(
    (admin) =>
      normalizeVillage(admin.village) ===
      normalizeVillage(citizen.village)
  );

  if (!matchingAdmin) {
    return res.status(403).json({
      message: "Your village is not configured for registration.",
    });
  }

  await db.collection("citizens").updateOne(
    { _id: citizen._id },
    { $set: { status: "Approved" } }
  );

  citizen.status = "Approved";
}

    const token = jwt.sign(
      {
        id: citizen._id.toString(),
        role: "citizen",
        village: citizen.village,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Login successful",
      token,
      citizen: {
        id: citizen._id.toString(),
        name: citizen.name,
        username: citizen.username,
        village: citizen.village,
      },
    });
  } catch (error) {
    console.error("Citizen login error:", error);
    return res.status(500).json({ message: "Unable to log in" });
  }
});

// Admin: list pending citizen registrations.
router.get("/citizens/pending", verifyAdmin, async (req, res) => {
  try {
    const db = await connectDB();
    const pending = await db.collection("citizens")
      .find({ status: "Pending" })
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({ citizens: pending });
  } catch (error) {
    console.error("Pending citizen lookup error:", error);
    return res.status(500).json({
      message: "Unable to retrieve pending registrations",
    });
  }
});

// Admin: approve or reject a citizen.
router.patch("/citizens/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid citizen ID" });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Approved or Rejected",
      });
    }

    const db = await connectDB();
    const result = await db.collection("citizens").updateOne(
      { _id: new ObjectId(id), status: "Pending" },
      {
        $set: {
          status,
          reviewedAt: new Date(),
          reviewedBy: req.admin.id,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Pending citizen registration not found",
      });
    }

    return res.json({ message: `Citizen ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error("Citizen status update error:", error);
    return res.status(500).json({
      message: "Unable to update citizen status",
    });
  }
});

module.exports = router;
  