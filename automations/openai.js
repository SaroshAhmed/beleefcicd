const axios = require("axios");
const Property = require("../models/Property");
const { analyzeImagesAIUrls, guessBattleAxe } = require("../utils/openai");
const { getMapStaticImage } = require("../utils/maps");
const databaseConnect = require("../config/database");

// Connect to the database
databaseConnect();

// Fetch properties from the Property table
async function fetchProperties() {
  try {
    return await Property.find({
      suburb: { $in: ["PEAKHURST", "CONNELLS POINT"] },
      isCleaned: false
    });
    // return await Property.find({ propertyId:"IL-2019-FD" });
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
    propertyType,
    latitude,
    longitude,
  } = property;

  // Base prompt construction
  let prompt = `Suburb: ${suburb}\nAddress: ${address}\nHeadline: ${headline}\nDescription: ${description}\n`;
  prompt += `Output should be in JSON format and include the following fields:\n`;

  // JSON structure for property details
  let jsonStructure = {
    // buildType: "[enum: 1 storey, 2 storey, 3 storey, 4+ storey]",
    // wallMaterial: "[enum: Brick, Double brick, Clad, Fibro, Hebel]",
    waterViews:
      "[enum: No, Water views, Deep waterfront with jetty, Tidal waterfront with jetty, Waterfront reserve]",
    // finishes: "[enum: High-end finishes, Updated, Original]",
    // streetTraffic: "[enum: Low traffic, Moderate traffic, High traffic]",
    // topography:
    //   "multiples can be selected but only from this list [High side, Low side, Level block, Irregular block, Unusable land]",
    // frontage:
    //   "Extract frontage value from the description or headline only. Donot give a range. (its type should be a number). If not present then put null",
    // landArea:
    //   landArea ||
    //   "Extract landArea value from the description or headline only. Donot give a range.(its type should be a number). Do not confuse it with internal space that is different. If not present then put null",
    // configurationPlan:
    //   "Write about the configuration plan in a short paragraph and in sales advertising style",
    // developmentPotential:
    //   "First check in the description if the word developmentPotential is present. If present, specify which type. Note if there are multiple matches, you can select only one otherwise it will give an error because it's an enum. [enum: Childcare, Duplex site, Townhouse site, Unit site]. If not present, then put null",
    // grannyFlat: "[enum: Yes, No]",
  };

  // Override certain fields if the property type is VacantLand
  if (propertyType === "VacantLand") {
    jsonStructure.buildType = null;
    jsonStructure.wallMaterial = null;
    jsonStructure.finishes = null;
    jsonStructure.configurationPlan = null;
    jsonStructure.grannyFlat = null;
  }

  // Construct the JSON structure into a string and add it to the prompt
  prompt += JSON.stringify(jsonStructure, null, 2);

  // Filter and include the image URLs from the media array
  const imageUrls = media
    .filter((item) => item.type === "photo")
    .slice(0, 19)
    .map((item) => item.url);

  // Add floorplan image if available
  const floorplan = media.find((item) => item.type === "floorplan");
  if (floorplan) {
    imageUrls.push(floorplan.url);
  }

  // Call the OpenAI service with the constructed prompt and images
  try {
    // const imageBuffer = await getMapStaticImage(latitude, longitude);
    // const battleAxe = await guessBattleAxe(imageBuffer);
    // const battleAxeResult = JSON.parse(battleAxe);

    const result = await analyzeImagesAIUrls(imageUrls, prompt);
    Object.keys(result).forEach((key) => {
      if (result[key] === "null") {
        result[key] = null;
      }
    });
console.log(result)
    // Log the result and update the property in the database
    console.log(
      `ListingId: ${listingId} with PropertyId:${propertyId} is cleaned`
    );

    // Update the Property table with the analyzed data

    await Property.updateOne(
      { listingId },
      {
        ...result,
        isCleaned: true, // Set isCleaned to true
      }
    );
  } catch (error) {
    console.error(`Error analyzing propertyId ${propertyId}:`, error.message);
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
