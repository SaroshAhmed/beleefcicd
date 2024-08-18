const axios = require("axios");
const Property = require("../models/Property");
const { DOMAIN_API_KEY } = require("../config");
const databaseConnect = require("../config/database");

// Connect to the database
databaseConnect();

// Fetch all properties where propertyId is null
async function fetchPropertiesWithoutPropertyId() {
  try {
    return await Property.find({ propertyId: null, isNewDevelopment: null });
  } catch (error) {
    console.error(
      "Error fetching properties without propertyId:",
      error.message
    );
    throw error;
  }
}

// Fetch listing details by listingId from the API
async function fetchListingDetails(listingId) {
  try {
    const response = await axios.get(
      `https://api.domain.com.au/v1/listings/${listingId}`,
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
      `Error fetching listing details for ID ${listingId}:`,
      error.message
    );
    throw error;
  }
}

// Update the Property table with the fetched data
async function updateProperty(listingId, updateData) {
  try {
    await Property.updateOne({ listingId }, updateData);
    console.log(`Successfully updated property with listingId ${listingId}`);
  } catch (error) {
    console.error(
      `Error updating property with listingId ${listingId}:`,
      error.message
    );
    throw error;
  }
}

// Process each property and update its details
async function processProperties() {
  try {
    const properties = await fetchPropertiesWithoutPropertyId();

    for (const property of properties) {
      try {
        const listingDetails = await fetchListingDetails(property.listingId);
        const updateData = {
          propertyId: listingDetails.propertyId,
          media: listingDetails.media,
          headline: listingDetails.headline,
          description: listingDetails.description,
          saleProcess:
            listingDetails.saleDetails?.soldDetails?.soldAction ||
            listingDetails.saleDetails?.saleMethod,
          channel: listingDetails.channel,
          isNewDevelopment: listingDetails.isNewDevelopment,
        };

        await updateProperty(property.listingId, updateData);
      } catch (error) {
        console.error(
          `Failed to process listingId ${property.listingId}:`,
          error.message
        );
        continue; // Continue with the next property
      }
    }
  } catch (error) {
    console.error("Error processing properties:", error.message);
  }
}

// Run the process
processProperties();
