const mongoose = require("mongoose");
const databaseConnect = require("../config/database");
const Property = require("../models/Property");

databaseConnect();

async function addPropertyIdNull() {
  try {
    // Update all documents where propertyId is missing
    await Property.updateMany(
      // { propertyId: { $exists: false } }, // Check if propertyId does not exist
      { $set: { isCleaned: false } }      // Set propertyId to null
    );

    console.log("propertyId set to null on all relevant documents.");
  } catch (error) {
    console.error("Error updating documents:", error.message);
  } finally {
    mongoose.connection.close();
  }
}

addPropertyIdNull();
