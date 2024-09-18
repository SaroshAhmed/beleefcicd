// addMarketingFieldsToUserProperty.js

const mongoose = require("mongoose");
const databaseConnect = require("../config/database"); // Adjust the path as necessary
const UserProperty = require("../models/UserProperty"); // Adjust the path as necessary

// Connect to the database
databaseConnect();

// Async function to perform the migration
async function addMarketingFields() {
  try {
    // Define the fields to be added
    const marketingPrice = "$5000-8000";
    const marketingItems = [
      "Photography",
      "Floorplan",
      "Video",
      "Copywriting",
      "Styling",
      "Brochures",
      "Signboard",
      "Mailcards",
      "Social media",
      "Realestate.com.au",
      "Domain.com.au",
      "Ausrealty.com.au",
      "Auctioneer",
    ];

    // Update all documents in the UserProperty collection
    const result = await UserProperty.updateMany(
      {
        // Optional: Only update documents that do not already have the marketing fields
        $or: [
          { marketingPrice: { $exists: false } },
          { marketingItems: { $exists: false } },
        ],
      },
      {
        $set: {
          marketingPrice,
          marketingItems,
        },
      }
    );

    console.log(
      `Migration completed. Modified ${result.modifiedCount} documents.`
    );
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

// Execute the migration
addMarketingFields();
