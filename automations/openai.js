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
      // suburb: { $in: ["PEAKHURST", "CONNELLS POINT"] },
      // postcode:"2210",
      // propertyId: "XI-8886-ST",
      isCleaned: false,
      media: { $ne: null },
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
    propertyId,
    listingId,
    propertyType,
    latitude,
    longitude,
    landArea,
    buildingArea,
  } = property;

  // Base prompt construction
  let prompt = `Suburb: ${suburb}\nAddress: ${address}\nHeadline: ${headline}\nDescription: ${description}\n`;
  prompt += `Output should be in JSON format and include the following fields:\n`;

  // JSON structure for property details
  let jsonStructure = {
    landArea:
      propertyType !== "ApartmentUnitFlat" && landArea === null
        ? "Extract landArea value from the description or headline only. Do not confuse with internal area or internal space, which is a different thing. Do not give a range. Its value should be of type number. If not present, then put null"
        : landArea,

    buildingArea:
      propertyType === "ApartmentUnitFlat" && buildingArea === null
        ? "Extract buildingArea value from the description or headline only. Do not give a range. Its value should be of type number. If not present, then put null"
        : buildingArea,

    aiPropertyType:
      propertyType === "House"
        ? "Run aiPropertyType to determine the property type. It must be one of these: [ApartmentUnitFlat, Duplex, House, Terrace, Townhouse, VacantLand, Villa]"
        : "",

    battleAxe: `Check only the top view or floor plan of the property to determine if it meets any of the following conditions for being a battleaxe property:
        1. The property is located behind another property and has a narrow driveway or access path leading from the street to the main property.
        2. The property is long and thin, or has a narrow strip of land (handle) connecting it to the road, which may indicate a battleaxe.
        3. If the property has limited or no direct street frontage but is accessible through a shared or private driveway, it may be a battleaxe.
        4. Look for a flag-shaped or T-shaped layout in satellite images or floor plans, indicating a typical battleaxe configuration.
        5. Empty land with a narrow access path should be considered a battleaxe, but large empty properties without this access should not.
     
        If any of the above points are true based on the images or floor plan, mark the property as 'Yes' for battleaxe. Otherwise, mark it as 'No'.
        
        [enum: Yes, No]`,

    buildType: "[enum: 1 storey, 2 storey, 3 storey, 4+ storey]",

    wallMaterial: "[enum: Brick, Double brick, Clad, Fibro, Hebel]",

    waterViews:
      "[enum: No, Water views, Deep waterfront with jetty, Tidal waterfront with jetty, Waterfront reserve]",

    finishes: "[enum: High-end finishes, Updated, Original]",

    streetTraffic: "[enum: Low traffic, Moderate traffic, High traffic]",

    pool: "[enum: Yes, No]",

    tennisCourt: "[enum: Yes, No]",

    topography:
      "This should be an array. Multiple selections can be made, but only from this list: [High side, Low side, Level block, Irregular block, Unusable land]",

    frontage:
      "Extract frontage value from the description or headline only. Do not give a range. Its type should be a number. If not present, then put null",

    configurationPlan:
      "Write about the configuration plan in a short paragraph in a sales advertising style",

    developmentPotential:
      "First check in the description if the word 'developmentPotential' is present. If present, specify the type. Only one can be selected from the following list: [Childcare, Duplex site, Townhouse site, Unit site]. If 'granny flat' is mentioned, make developmentPotential null. If not present, put null.",

    grannyFlat: "[enum: Yes, No]",
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
