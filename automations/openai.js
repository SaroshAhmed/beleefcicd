const axios = require("axios");
const Property = require("../models/Property");
const ErrorLog = require("../models/ErrorLog");
const { analyzeImagesAIUrls } = require("../utils/openai");
const databaseConnect = require("../config/database");

// Connect to the database
databaseConnect();

// Fetch properties from the Property table
async function fetchProperties() {
  try {
    return await Property.find({ isCleaned: false });
  } catch (error) {
    console.error("Error fetching properties:", error.message);
    throw error;
  }
}

// Create prompt for OpenAI and call the service
async function generatePromptAndAnalyze(property) {
  const {
    suburb,
    address,
    headline,
    description,
    media,
    landArea,
    propertyId,
    listingId,
  } = property;

  // Construct the prompt with provided data
  let prompt = `Suburb: ${suburb}\nAddress: ${address}\nHeadline: ${headline}\nDescription: ${description}\n`;
  prompt += `Output should be in JSON format and include the following fields:\n`;
  prompt += `{
    "buildType": "[enum: 1 storey, 2 storey, 3 storey, 4+ storey]",
    "wallMaterial": "[enum: Brick, Double brick, Clad, Fibro, Hebel]",
    "waterViews": "[enum: Yes, No, Deep water, Tidal water, Waterfront reserve, Waterfront with jetty]",
    "finishes": "[enum: High-end finishes, Standard finishes, Low-end finishes, Updated, Original]",
    "streetTraffic": "[enum: Low traffic, Moderate traffic, High traffic]",
    "topography": "multiples can be selected but from this list only [High side, Low side, Level block, Irregular block, Unusable land]",
    "frontage": "Extract from the description (its type should be a number). If not present then put null",
    "landArea": "${
      landArea
        ? landArea
        : "Extract from the description or floorplan (its type should be a number). Donot confuse it with internal space that is different. If not present then put null"
    }",
    "configurationPlan": "Write about the configuration plan in a short paragraph and in sales advertising style",
    "developmentPotential": "First check in the description if the word developmentPotential is present. If present, specify which type [enum: Childcare, Duplex site, Townhouse site, Unit site]. If not present, put null",
    "grannyFlat": "[enum: Yes, No]"
  }\n`;

  // Filter and include the first 5 image URLs from the media array
  const imageUrls = media
    .filter((item) => item.type === "photo")
    .slice(0, 5)
    .map((item) => item.url);

  // Add floorplan image if available
  const floorplan = media.find((item) => item.type === "floorplan");
  if (floorplan) {
    imageUrls.push(floorplan.url);
  }

  // Call the OpenAI service with the constructed prompt and images
  try {
    const result = await analyzeImagesAIUrls(imageUrls, prompt);

    // Log the result and update the property in the database
    console.log("PropertyId:", propertyId, "cleaned");

    // Update the Property table with the analyzed data
    await Property.updateOne(
      { propertyId },
      {
        ...result,
        isCleaned: true, // Set isCleaned to true
      }
    );
  } catch (error) {
    console.error(`Error analyzing propertyId ${propertyId}:`, error.message);
    await ErrorLog.create({
      error: `Error cleaning data for listingId ${listingId} and propertyId: ${propertyId}`,
      api: "openai",
      type: "AIcleaning",
      details: { error: error.message },
    });
  }
}

// Process each property and generate the prompt
async function processProperties() {
  try {
    const properties = await fetchProperties();
    for (const property of properties) {
      await generatePromptAndAnalyze(property);
    }
  } catch (error) {
    console.error("Error processing properties:", error.message);
  }
}

// Run the process
processProperties();
