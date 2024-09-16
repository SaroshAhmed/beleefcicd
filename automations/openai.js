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
      isCleaned: false,
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

    battleAxe: `See if the top view of the property is visible. Check the following to determine if the property is a battleaxe: 
       1. The property is typically located behind another property, with a narrow driveway or access path leading from the street to the main property.
       2. Look for a long, thin access road leading to the property, often called the 'handle' of the battleaxe.
       3. If the property has shared driveway access or is hidden from the street view, it's more likely to be a battleaxe.
       4. Check if the property is landlocked or behind another lot, with limited street frontage.
       5. Empty land properties should not be considered battleaxe unless they clearly have the narrow access path described above.
       6. Satellite images or property layouts can help identify a battleaxe configuration (e.g., a flag-shaped or T-shaped plot).
       7. Confirm by cross-referencing the property’s lot layout, driveway access, and descriptions.
       
       Important Note: A battleaxe property typically has a narrow accessway to the street and sits behind another property. It may share access with neighboring properties. Empty lands without this configuration are not considered battleaxe.
       
       [enum: No, Yes]`,

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
