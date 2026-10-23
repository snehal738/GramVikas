
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();

    console.log("MongoDB Connected Successfully!");

    return client.db("gramvikas");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    throw error;
  }
}

module.exports = connectDB;
