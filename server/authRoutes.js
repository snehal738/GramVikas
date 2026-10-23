
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("./db");

const router = express.Router();

// Admin registration

router.post("/register", async (req, res) => {
  return res.status(403).json({
    message:
      "Public admin registration is disabled. Contact the system administrator.",
  });
});


// Admin login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const db = await connectDB();

    const admin = await db.collection("admins").findOne({
      username,
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
      { id: admin._id.toString(), role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login successful",
      token,
      username: admin.username,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
