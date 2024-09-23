const axios = require("axios");
const Property = require("../models/Property");
const ErrorLog = require("../models/ErrorLog");
const { DOMAIN_API_KEY } = require("../config");
const databaseConnect = require("../config/database");

// Connect to the database
databaseConnect();

// Fetch all properties where propertyId exists and history null
async function fetchPropertiesWithPropertyId() {
  try {
    // in future put error porperties if in here
    return await Property.find({
      propertyId: { $ne: null },
      history: null, // some properties already passed through this api has history null so we cant entirely depend on that check
      urlSlug: null,
    });
  } catch (error) {
    console.error(
      "Error fetching properties without propertyId:",
      error.message
    );
    throw error;
  }
}

// Fetch property details by propertyId from the API
async function fetchPropertyDetails(propertyId) {
  try {
    const response = await axios.get(
      `https://api.domain.com.au/v1/properties/${propertyId}`,
      {
        headers: {
          accept: "application/json",
          "X-Api-Key": DOMAIN_API_KEY,
          "X-Api-Call-Source": "live-api-browser",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching property details for ID ${propertyId}:`,
      error.message
    );
    throw error;
  }
}

// Update the Property table with the fetched data
async function updateProperty(propertyId, updateData) {
  try {
    await Property.updateOne({ propertyId }, updateData);
    console.log(`Successfully updated property with propertyId ${propertyId}`);
  } catch (error) {
    console.error(
      `Error updating property with propertyId ${propertyId}:`,
      error.message
    );
    throw error;
  }
}

// Find and handle duplicate propertyIds
async function handleDuplicatePropertyIds() {
  try {
    const duplicates = await Property.aggregate([
      { $match: { propertyId: { $ne: null } } },
      {
        $group: {
          _id: "$propertyId",
          docs: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    for (const duplicate of duplicates) {
      const { docs } = duplicate;
      let keepDoc;

      if (docs.some((doc) => doc.history)) {
        // Keep the first document with history
        keepDoc = docs.find((doc) => doc.history);
      } else {
        // Keep the first document
        keepDoc = docs[0];
      }

      const docsToRemove = docs.filter(
        (doc) => doc._id.toString() !== keepDoc._id.toString()
      );

      for (const doc of docsToRemove) {
        // Log the deletion in errorLogs
        await ErrorLog.create({
          error: `Listing id ${doc.listingId} has duplicate propertyId: ${doc.propertyId}`,
          api: "v1/properties/id",
          type: "duplicatePropertyId",
          details: doc,
        });

        // Remove the duplicate document
        await Property.deleteOne({ _id: doc._id });
        console.log(
          `Removed duplicate property with listingId ${doc.listingId}`
        );
      }
    }
  } catch (error) {
    console.error("Error handling duplicate propertyIds:", error.message);
  }
}

// Process each property and update its details
async function processProperties() {
  try {
    const properties = await fetchPropertiesWithPropertyId();

    for (const property of properties) {
      try {
        const propertyDetails = await fetchPropertyDetails(property.propertyId);
        const updateData = {
          history: propertyDetails.history,
          urlSlug: propertyDetails.urlSlug,
          canonicalUrl: propertyDetails.canonicalUrl,
        };

        await updateProperty(property.propertyId, updateData);
      } catch (error) {
        console.error(
          `Failed to process propertyId ${property.propertyId}:`,
          error.message
        );
        continue; // Continue with the next property
      }
    }

    // Handle duplicate propertyIds after processing
    await handleDuplicatePropertyIds();
  } catch (error) {
    console.error("Error processing properties:", error.message);
  }
}

// Run the process
processProperties();
