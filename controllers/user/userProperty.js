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
  if (propertyType === "VacantLand") {
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
    address += " NSW";

    const response = await axios.get(
      `https://api.domain.com.au/v1/properties/_suggest?terms=${encodeURIComponent(
        address
      )}&pageSize=1&channel=Residential`,
      {
        headers: {
          accept: "application/json",
          "X-Api-Key": DOMAIN_API_KEY, // Ensure DOMAIN_API_KEY is available in your environment
          "X-Api-Call-Source": "live-api-browser",
        },
      }
    );

    // Check if the response has data and extract the id from the first result
    if (
      response.data &&
      response.data.length > 0 &&
      response.data[0]?.address.toLowerCase().includes(suburb.toLowerCase())
    ) {
      const propertyId = response.data[0].id;
 
      const pResponse = await axios.get(
        `https://api.domain.com.au/v1/properties/${propertyId}`,
        {
          headers: {
            accept: "application/json",
            "X-Api-Key": DOMAIN_API_KEY,
            "X-Api-Call-Source": "live-api-browser",
          },
        }
      );
      const propertyDetails = pResponse.data;

      const listingId = propertyDetails?.photos[0]?.advertId;
      if (!listingId) {
        const imageBuffer = await getMapStaticImage(
          propertyDetails?.addressCoordinate.lat,
          propertyDetails?.addressCoordinate.lon
        );
        const aiResponse = await mapAerialImgAnalyze(imageBuffer);

        const property = await Property.create({
          address: propertyDetails?.address.replace(/,? NSW.*$/, ""),
          listingType: "Sale",
          price: null,
          waterViews: aiResponse.waterViews,
          postcode: propertyDetails?.postcode,
          suburb: propertyDetails?.suburb.toUpperCase(),
          latitude: propertyDetails?.addressCoordinate.lat,
          longitude: propertyDetails?.addressCoordinate.lon,
          propertyType: propertyDetails?.propertyType,
          bedrooms: propertyDetails?.bedrooms || null,
          bathrooms: propertyDetails?.bathrooms || null,
          carspaces: propertyDetails?.carspaces || null,
          landArea:
            propertyDetails?.propertyType !== "ApartmentUnitFlat"
              ? propertyDetails?.areaSize
              : null,
          buildingArea:
            propertyDetails?.propertyType === "ApartmentUnitFlat"
              ? propertyDetails?.areaSize
              : null,
          features: propertyDetails?.features,
          propertyId,
          channel: "residential",
          urlSlug: propertyDetails.urlSlug,
          canonicalUrl: propertyDetails.canonicalUrl,
          fetchMode: "manual",
        });
        return property;
      }
      const lResponse = await axios.get(
        `https://api.domain.com.au/v1/listings/${listingId}`,
        {
          headers: {
            accept: "application/json",
            "X-Api-Key": DOMAIN_API_KEY,
            "X-Api-Call-Source": "live-api-browser",
          },
        }
      );

      const listingDetails = lResponse.data;

      const daysListed = listingDetails.saleDetails?.soldDetails?.soldDate
        ? calculateDaysListed(
            listingDetails.dateListed,
            listingDetails.saleDetails?.soldDetails?.soldDate
          )
        : null;

      const data = {
        listingId,
        address: propertyDetails?.address.replace(/,? NSW.*$/, ""),
        listingType: listingDetails.saleMode == "sold" ? "Sold" : "Sale",
        price: listingDetails.saleDetails?.soldDetails?.soldPrice || null,
        postcode: listingDetails.addressParts.postcode,
        suburb: listingDetails.addressParts.suburb.toUpperCase(),
        latitude: listingDetails.geoLocation.latitude,
        longitude: listingDetails.geoLocation.longitude,
        propertyType: propertyDetails.propertyType,
        bedrooms: listingDetails.bedrooms,
        bathrooms: listingDetails.bathrooms,
        carspaces: listingDetails.carspaces,
        landArea:
          propertyDetails.propertyType !== "ApartmentUnitFlat"
            ? propertyDetails.areaSize
            : null,
        buildingArea:
          propertyDetails.propertyType === "ApartmentUnitFlat"
            ? propertyDetails.areaSize
            : null,
        features: propertyDetails.features,
        dateListed: listingDetails.dateListed,
        daysListed,
        propertyId,
        media: listingDetails.media,
        headline: listingDetails.headline,
        description: listingDetails.description,
        saleProcess:
          listingDetails.saleDetails?.soldDetails?.soldAction ||
          listingDetails.saleDetails?.saleMethod,
        channel: listingDetails.channel,
        isNewDevelopment: listingDetails.isNewDevelopment,
        listingStatus: listingDetails.status,
        saleMode: listingDetails.saleMode,
        history: propertyDetails.history,
        urlSlug: propertyDetails.urlSlug,
        canonicalUrl: propertyDetails.canonicalUrl,
        fetchMode: "manual",
      };

      // // Function to retry AI analysis
      // const retryAIAnalysis = async (data, maxRetries = 3) => {
      //   let attempts = 0;
      //   let aiResult = null;
      //   while (attempts < maxRetries) {
      //     try {
      //       aiResult = await generatePromptAndAnalyze(data);
      //       console.log(aiResult);
      //       if (aiResult) break; // If AI is successful, break out of loop
      //     } catch (error) {
      //       console.error(
      //         `Error analyzing propertyId ${data.propertyId} on attempt ${
      //           attempts + 1
      //         }:`,
      //         error.message
      //       );
      //     }
      //     attempts += 1;
      //   }
      //   if (!aiResult) {
      //     throw new Error(
      //       "Failed to generate AI analysis after multiple attempts"
      //     );
      //   }
      //   return aiResult;
      // };

      // // Get AI result, retry if necessary
      // const ai = await retryAIAnalysis(data);

      // Merging AI result into data and saving to the database
      const property = await Property.create({
        ...data,
        // ...ai,
        // isCleaned: true,
      });
      return property;
    } else {
      // console.log(address, suburb, postcode, latitude, longitude);
      // const imageBuffer = await getMapStaticImage(latitude, longitude);
      // const aiResponse = await mapAerialImgAnalyze(imageBuffer);
      // console.log(aiResponse);

      const property = await Property.create({
        address: address.replace(/,? NSW.*$/, ""),
        listingType: "Sale",
        price: null,
        // waterViews: aiResponse.waterViews,
        postcode: postcode,
        suburb: suburb.toUpperCase(),
        latitude,
        longitude,
        // propertyType: aiResponse.propertyType,
        channel: "residential",
        fetchMode: "manual",
      });
      return property;
    }
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

  // Utility function to extract the initial part of the address (street number and name)
  // const extractStreetAddress = (fullAddress) => {

  //   let addressWords = fullAddress
  //     .replace(/[,]/g, "") // Remove commas
  //     .split(" ") // Split by spaces
  //     .filter(
  //       (w) =>
  //         w &&
  //         !["nsw", "act", "vic", "qld", "tas", "sa", "wa", "nt"].includes(
  //           w.toLowerCase()
  //         ) // Ignore state abbreviations
  //     );

  //   // Extract up to the third word (street number and name)
  //   return addressWords.slice(0, 4).join(" ");
  // };

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
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape regex special characters
  };

  let inputStreetAddress = extractStreetAddress(address);
  // console.log("Processed Input Address:", inputStreetAddress);

  // Split the input address into words
  let addressWords = inputStreetAddress.split(" ");

  // Construct a regex pattern that allows for optional commas and spaces
  let regexPattern = addressWords
    .map((word) => escapeRegex(word))
    .join("[,\\s]*");
  // console.log("Regex Pattern:", regexPattern);

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

    if (!property) {
      console.log("property not found");
      property = await runtimeFetchProperty(
        address,
        suburb,
        postcode,
        latitude,
        longitude
      );
    }

    if (!property.listingId) {
      console.log("listing Id not found");
      // Convert the property document to a plain object
      const propertyData = property.toObject();

      // Remove the _id field from the propertyData
      const { _id, ...restPropertyData } = propertyData;

      // Insert directly into UserProperty without creating Property
      const boxStatus = [
        { name: "bookAppraisal", status: "unlock" },
        { name: "priceProcess", status: "unlock" },
        { name: "postList", status: "lock" },
        { name: "authoriseSchedule", status: "unlock" },
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

      const userProperty = await UserProperty.create({
        userId: id,
        ...restPropertyData,
        boxStatus,
        processChain,
      });

      return res.status(200).json({ success: true, data: userProperty });
    }

    // Convert the property document to a plain object
    const propertyData = property.toObject();

    // Remove the _id field from the propertyData
    const { _id, ...restPropertyData } = propertyData;

    const boxStatus = [
      { name: "bookAppraisal", status: "unlock" },
      { name: "priceProcess", status: "unlock" },
      { name: "postList", status: "lock" },
      { name: "authoriseSchedule", status: "unlock" },
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

    // Create a new UserProperty document
    const userProperty = await UserProperty.create({
      userId: id,
      ...restPropertyData,
      boxStatus,
      processChain,
    });
    console.log(userProperty)

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

// exports.updateProperty = async (req, res) => {
//   const { id } = req.user; // User ID from authenticated user
//   const { address, boxStatusUpdates, ...updates } = req.body; // Destructure boxStatusUpdates and other updates

//   try {
//     // Find the property by userId and address
//     const userProperty = await UserProperty.findOne({
//       userId: id,
//       address: { $regex: new RegExp(address, "i") }, // Case-insensitive address match
//     });

//     if (!userProperty) {
//       return res.status(404).json({
//         success: false,
//         message: "Property not found for this user",
//       });
//     }

//     // Initialize the update object for other property fields
//     let updateQuery = {};

//     // Add other property fields to update if provided
//     if (Object.keys(updates).length > 0) {
//       updateQuery = { ...updateQuery, ...updates };
//     }

//     // If boxStatusUpdates is provided, update specific statuses within the boxStatus array
//     if (boxStatusUpdates && Array.isArray(boxStatusUpdates)) {
//       boxStatusUpdates.forEach((update, index) => {
//         const { name, status } = update;
//         updateQuery[`boxStatus.$[element${index}].status`] = status; // Use `element0`, `element1`, etc.
//       });
//     }

//     // Generate unique arrayFilters for each element in boxStatusUpdates
//     const arrayFilters = boxStatusUpdates
//       ? boxStatusUpdates.map((update, index) => ({
//           [`element${index}.name`]: update.name, // Use unique element filters
//         }))
//       : [];

//     // Perform the update using $set and arrayFilters
//     const updatedProperty = await UserProperty.findOneAndUpdate(
//       { userId: id, address: { $regex: new RegExp(address, "i") } },
//       {
//         $set: updateQuery,
//       },
//       {
//         arrayFilters: arrayFilters, // Apply arrayFilters based on unique placeholders
//         new: true, // Return the updated document
//       }
//     );

//     if (!updatedProperty) {
//       return res.status(404).json({
//         success: false,
//         message: "Failed to update the property",
//       });
//     }

//     return res.status(200).json({ success: true, data: updatedProperty });
//   } catch (error) {
//     console.error("Error updating property: ", error.message);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

exports.updateProperty = async (req, res) => {
  const { id } = req.user; // User ID from authenticated user
  const { address, boxStatusUpdates, ...updates } = req.body; // Destructure boxStatusUpdates and other updates
  console.log(address);
  console.log(boxStatusUpdates);

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
      "vendorDetails"
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

    console.log(updatedProperty.address);
    console.log(updatedProperty.boxStatus);

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
