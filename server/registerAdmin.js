
require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("./db");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter admin username: ", async (username) => {
  rl.question("Enter admin password (minimum 8 characters): ", async (password) => {
    rl.question("Enter ADMIN_SETUP_SECRET from your .env: ", async (secret) => {
      try {
        if (!username.trim() || password.length < 8) {
          throw new Error("Username is required and password must be at least 8 characters.");
        }

        if (!process.env.ADMIN_SETUP_SECRET ||
            secret !== process.env.ADMIN_SETUP_SECRET) {
          throw new Error("Admin setup secret does not match .env.");
        }

        const db = await connectDB();
        const admins = db.collection("admins");

        const existing = await admins.findOne({
          username: username.trim(),
        });

        if (existing) {
          throw new Error("This admin username already exists.");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await admins.insertOne({
          username: username.trim(),
          password: hashedPassword,
          role: "admin",
          createdAt: new Date(),
        });

        console.log("Admin registered successfully!");
      } catch (error) {
        console.error("Registration failed:", error.message);
      } finally {
        rl.close();
        process.exitCode = 0;
      }
    });
  });
});
