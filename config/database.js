const mongoose = require("mongoose");
const { MONGO_URI } = require("../config");

const maxRetries = 5; // Maximum number of retries
let retryCount = 0; // Initial retry count
const retryInterval = 5000; // Retry interval in milliseconds (5 seconds)

const databaseConnect = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected");
    retryCount = 0; // Reset retry count after successful connection
  } catch (err) {
    console.error("MongoDB connection error:", err);
    retryCount += 1;

    if (retryCount < maxRetries) {
      console.log(
        `Retrying connection attempt ${retryCount} in ${
          retryInterval / 1000
        } seconds...`
      );
      setTimeout(databaseConnect, retryInterval);
    } else {
      console.error("Maximum retries reached. Could not connect to MongoDB.");
    }
  }
};

module.exports = databaseConnect;
