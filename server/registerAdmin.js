
require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("./db");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  try {
    const username = (await ask("Enter admin username: ")).trim();
    const password = await ask(
      "Enter admin password (minimum 8 characters): "
    );
    const village = (await ask("Enter admin village name: ")).trim();
    const secret = await ask("Enter ADMIN_SETUP_SECRET from your .env: ");

    if (!username || password.length < 8 || !village) {
      throw new Error(
        "Username, village, and a password of at least 8 characters are required."
      );
    }

    if (
      !process.env.ADMIN_SETUP_SECRET ||
      secret !== process.env.ADMIN_SETUP_SECRET
    ) {
      throw new Error("Admin setup secret does not match .env.");
    }

    const db = await connectDB();
    const admins = db.collection("admins");

    const existing = await admins.findOne({ username });

    if (existing) {
      throw new Error(
        "This admin username already exists. Existing admin was not changed."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await admins.insertOne({
      username,
      password: hashedPassword,
      village,
      role: "admin",
      createdAt: new Date(),
    });

    console.log("Admin registered successfully!");
    console.log("Village:", village);
  } catch (error) {
    console.error("Registration failed:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main();
