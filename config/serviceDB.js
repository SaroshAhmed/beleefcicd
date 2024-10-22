const { MongoClient } = require('mongodb');
const { MONGO_URI } = require('../config'); // Assuming your config contains the MONGO_URI

let db = null;

const connectToDatabase = async () => {
  try {
    if (db) return db; // If already connected, return the db instance

    const client = await MongoClient.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected using native driver");

    db = client.db(); // Get the database instance
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
};

module.exports = connectToDatabase;
