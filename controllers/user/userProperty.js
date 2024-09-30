const mongoose = require("mongoose");
const UserProperty = require("../../models/UserProperty");
const Property = require("../../models/Property");
const { DOMAIN_API_KEY } = require("../../config");
const {
  analyzeImagesAIUrls,
  mapAerialImgAnalyze,
} = require("../../utils/openai");
const axios = require("axios");
const { getMapStaticImage } = require("../../utils/maps");

// Helper Function to Calculate Days Listed
function calculateDaysListed(dateListed, soldDate) {
  const listedDate = new Date(dateListed);
  const soldDateObject = new Date(soldDate);
  const diffTime = Math.abs(soldDateObject - listedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

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
    buildType: "[enum: 1 storey, 2 storey, 3 storey, 4+ storey]",
    wallMaterial: "[enum: Brick, Double brick, Clad, Fibro, Hebel]",
    waterViews:
      "[enum: No, Water views, Deep waterfront with jetty, Tidal waterfront with jetty, Waterfront reserve]",
    finishes: "[enum: High-end finishes, Updated, Original]",
    streetTraffic:
      "It should be one of the list [enum: Low traffic, Moderate traffic, High traffic]",
    pool: "[enum: Yes, No]",
    tennisCourt: "[enum: Yes, No]",
    topography:
      "type array. multiples can be selected but only from this list [High side, Low side, Level block, Irregular block, Unusable land]",
    landArea:
      propertyType !== "ApartmentUnitFlat" && landArea === null
        ? "Extract landArea value from the description or headline only.Donot confuse with internal area or internal space that is different thing. Do not give a range. Its value should be number type. If not present then put null"
        : landArea,
    buildingArea:
      propertyType === "ApartmentUnitFlat" && buildingArea === null
        ? "Extract buildingArea value from the description or headline only. Do not give a range. Its value should be number type. If not present then put null"
        : buildingArea,
    frontage:
      "Extract frontage value from the description or headline only. Do not give a range. Its value should be float type. If not present then put null",
    configurationPlan:
      "Write about the configuration plan in a short paragraph and in sales advertising style",
    developmentPotential:
      "First check in the description if the word developmentPotential is present. If present, specify which type. If not present, then put null. [enum: Childcare, Duplex site, Townhouse site, Unit site]. If development Potential is granny flat, make it null.",
    grannyFlat: "[enum: Yes, No]",
  };

  // Override certain fields if the property type is VacantLand
  if (propertyType === "VacantLand" || propertyType === "Land") {
    jsonStructure.buildType = null;
    jsonStructure.wallMaterial = null;
    jsonStructure.finishes = null;
    jsonStructure.configurationPlan = null;
    jsonStructure.grannyFlat = null;
  }

  prompt += JSON.stringify(jsonStructure, null, 2);

  const imageUrls = media
    .filter((item) => item.type === "photo")
    .slice(0, 19)
    .map((item) => item.url);

  const floorplan = media.find((item) => item.type === "floorplan");
  if (floorplan) {
    imageUrls.push(floorplan.url);
  }

  try {
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

    return result;
  } catch (error) {
    console.error(`Error analyzing propertyId ${propertyId}:`, error.message);
  }
}

const runtimeFetchProperty = async (
  address,
  suburb,
  postcode,
  latitude,
  longitude
) => {
  try {
    const property = await Property.create({
      address: address.replace(/,? NSW.*$/, ""),
      listingType: "Sale",
      price: null,
      postcode: postcode,
      suburb: suburb.toUpperCase(),
      latitude,
      longitude,
      channel: "residential",
      fetchMode: "manual",
      isCleaned: false,
    });
    return property;
  } catch (error) {
    console.error(
      `Error fetching property details for address ${address}:`,
      error.message
    );
    throw error;
  }
};

exports.createProperty = async (req, res) => {
  const { id } = req.user;
  const { address, suburb, postcode, latitude, longitude } = req.body;

  const extractStreetAddress = (fullAddress) => {
    return fullAddress
      .replace(/[,]/g, "") // Remove commas from input address
      .toLowerCase() // Convert to lowercase
      .split(" ") // Split by spaces
      .filter(
        (w) =>
          w &&
          !["nsw", "act", "vic", "qld", "tas", "sa", "wa", "nt"].includes(
            w.toLowerCase()
          ) // Ignore state abbreviations
      )
      .slice(0, 4) // Extract up to the fifth word (adjust as needed)
      .join(" ");
  };

  const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  let inputStreetAddress = extractStreetAddress(address);
  let addressWords = inputStreetAddress.split(" ");
  let regexPattern = addressWords
    .map((word) => escapeRegex(word))
    .join("[,\\s]*");
  let regex = new RegExp(`^${regexPattern}.*`, "i");

  try {
    // Check if a UserProperty with the same userId and address already exists
    const userPropertyExists = await UserProperty.findOne({
      userId: id,
      address: { $regex: regex },
      ...(suburb && { suburb: { $regex: new RegExp(`^${suburb}$`, "i") } }),
    });

    if (userPropertyExists) {
      console.log("in user property exists");
      return res.status(200).json({ success: true, data: userPropertyExists });
    }

    // Find the property by address
    let property = await Property.findOne({
      address: { $regex: regex },
      ...(suburb && { suburb: { $regex: new RegExp(`^${suburb}$`, "i") } }),
    });

    const boxStatus = [
      { name: "bookAppraisal", status: "unlock" },
      { name: "priceProcess", status: "unlock" },
      { name: "postList", status: "lock" },
      { name: "authoriseSchedule", status: "lock" },
      { name: "prepareMarketing", status: "unlock" },
      { name: "goLive", status: "unlock" },
      { name: "onMarket", status: "unlock" },
    ];

    const processChain = [
      { label: "1", name: "Views", selected: null },
      { label: "2", name: "Enquiry", selected: null },
      { label: "3", name: "Inspection", selected: null },
      { label: "4", name: "Offers", selected: null },
      { label: "5", name: "Close Feedback", selected: null },
      { label: "6", name: "Vendor Acceptance", selected: null },
      { label: "7", name: "Solid", selected: null },
    ];

    if (property) {
      // Convert the property document to a plain object
      const propertyData = property.toObject();

      // Remove the _id field from the propertyData
      const { _id, ...restPropertyData } = propertyData;

      // Create a new UserProperty document
      const userProperty = await UserProperty.create({
        fkPropertyId: _id,
        userId: id,
        ...restPropertyData,
        boxStatus,
        processChain,
        marketingPrice: "$5000-8000",
        marketingItems: [
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
        ],
        isCleaned: true,
      });

      return res.status(200).json({ success: true, data: userProperty });
    }

    property = await runtimeFetchProperty(
      address,
      suburb,
      postcode,
      latitude,
      longitude
    );

    // Convert the property document to a plain object
    const propertyData = property.toObject();

    // Remove the _id field from the propertyData
    const { _id, ...restPropertyData } = propertyData;

    // Create a new UserProperty document
    const userProperty = await UserProperty.create({
      fkPropertyId: _id,
      userId: id,
      ...restPropertyData,
      boxStatus,
      processChain,
      marketingPrice: "$5000-8000",
      marketingItems: [
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
      ],
      isCleaned: false,
    });

    return res.status(200).json({ success: true, data: userProperty });
  } catch (error) {
    console.error("Error creating property:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPropertyByAddress = async (req, res) => {
  try {
    const { id } = req.user;
    const { address } = req.params;

    const userProperty = await UserProperty.findOne({
      userId: id,
      address: { $regex: new RegExp(address, "i") },
    });

    return res.status(200).json({ success: true, data: userProperty });
  } catch (error) {
    console.error("Error in getPropertyByAddress: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  const { id } = req.user; // User ID from authenticated user
  const { _id, address, boxStatusUpdates, deleteData, ...updates } = req.body; // Destructure boxStatusUpdates

  // Handle remove logic
  if (deleteData && deleteData.remove) {
    const { fieldPath } = deleteData;
    // Backend logic to handle deletion for marketingItems
    if (fieldPath.startsWith("marketingItems")) {
      const arrayIndexMatch = fieldPath.match(/marketingItems\[(\d+)\]/);
      if (arrayIndexMatch) {
        const index = parseInt(arrayIndexMatch[1], 10);

        // Use $unset to remove the item from the array at the specific index
        const unsetQuery = { $unset: { [`marketingItems.${index}`]: 1 } };
        await UserProperty.findByIdAndUpdate(_id, unsetQuery);

        // Pull any null elements out after the unset
        const updatedUserProperty = await UserProperty.findByIdAndUpdate(
          _id,
          { $pull: { marketingItems: null } }, // Remove null values from the array
          { new: true }
        );
        return res
          .status(200)
          .json({ success: true, data: updatedUserProperty });
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid field path for removal",
        });
      }
    }
  }

  try {
    // Find the property by userId and address
    const userProperty = await UserProperty.findOne({
      userId: id,
      address: { $regex: new RegExp(address, "i") }, // Case-insensitive address match
    });

    if (!userProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found for this user",
      });
    }

    // Fields allowed to be updated (you can add or remove as needed)
    const allowedFields = [
      "listingType",
      "propertyType",
      "battleAxe",
      "bedrooms",
      "bathrooms",
      "carspaces",
      "landArea",
      "buildingArea",
      "buildType",
      "yearBuilt",
      "wallMaterial",
      "pool",
      "tennisCourt",
      "waterViews",
      "finishes",
      "streetTraffic",
      "topography",
      "additionalInformation",
      "frontage",
      "configurationPlan",
      "grannyFlat",
      "developmentPotential",
      "logicalPrice",
      "logicalReasoning",
      "engagedPurchaser",
      "recommendedSales",
      "recommendedSold",
      "recentAreaSoldProcess",
      "currentAreaProcess",
      "duplexProperties",
      "engagedPurchaser",
      "boxStatus",
      "recommendedSaleProcess",
      "highEndProperties",
      "lowEndProperties",
      "vendorDetails",
      "marketingPrice",
      "microPockets"
    ];

    // Build the update query by including only allowed fields
    let updateQuery = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateQuery[key] = updates[key]; // Add allowed fields to updateQuery
      }
    });

    // If boxStatusUpdates is provided, update specific statuses within the boxStatus array
    if (boxStatusUpdates && Array.isArray(boxStatusUpdates)) {
      boxStatusUpdates.forEach((update, index) => {
        const { name, status } = update;
        updateQuery[`boxStatus.$[element${index}].status`] = status; // Use unique element placeholders
      });
    }

    // Generate unique arrayFilters for each element in boxStatusUpdates
    const arrayFilters = boxStatusUpdates
      ? boxStatusUpdates.map((update, index) => ({
          [`element${index}.name`]: update.name, // Use unique element filters
        }))
      : [];

    // Perform the update using $set and arrayFilters
    const updatedProperty = await UserProperty.findOneAndUpdate(
      { userId: id, address: { $regex: new RegExp(address, "i") } },
      {
        $set: updateQuery,
      },
      {
        arrayFilters: arrayFilters, // Apply arrayFilters based on unique placeholders
        new: true, // Return the updated document
      }
    );

    if (!updatedProperty) {
      return res.status(404).json({
        success: false,
        message: "Failed to update the property",
      });
    }

    return res.status(200).json({ success: true, data: updatedProperty });
  } catch (error) {
    console.error("Error updating property: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
