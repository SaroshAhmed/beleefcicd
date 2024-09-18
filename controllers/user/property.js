const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const UserProperty = require("../../models/UserProperty");
const Property = require("../../models/Property");
const Suburb = require("../../models/Suburb");
const Prompt = require("../../models/Prompt");
const { chatCompletion } = require("../../utils/openai");

exports.createProperty = async (req, res) => {
  const { id } = req.user;
  const { address } = req.body;

  try {
    // Check if a UserProperty with the same userId and address already exists
    const userPropertyExists = await UserProperty.findOne({
      userId: id,
      address,
    });

    if (userPropertyExists) {
      return res.status(200).json({ success: true, data: userPropertyExists });
    }

    // Find the property by address
    const property = await Property.findOne({
      address,
    });

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    // Convert the property document to a plain object
    const propertyData = property.toObject();

    const boxStatus = [
      { name: "bookAppraisal", status: "unlock" },
      { name: "priceProcess", status: "unlock" },
      { name: "postList", status: "lock" },
      { name: "authoriseSchedule", status: "unlock" },
      { name: "prepareMarketing", status: "unlock" },
      { name: "goLive", status: "unlock" },
      { name: "onMarket", status: "unlock" },
    ];

    // Create a new UserProperty document
    const userProperty = await UserProperty.create({
      userId: id,
      ...propertyData,
      boxStatus,
    });

    return res.status(200).json({ success: true, data: userProperty });
  } catch (error) {
    console.error("Error creating property:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPropertiesAddress = async (req, res) => {
  try {
    const properties = await Property.find(
      {},
      {
        address: 1,
      }
    );

    return res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error("Error fetching properties:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserPropertyByAddress = async (req, res) => {
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

exports.getPropertyByAddress = async (req, res) => {
  try {
    const { address } = req.params;

    const property = await Property.findOne({
      address: { $regex: new RegExp(address, "i") },
    });

    return res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.error("Error in getPropertyByAddress: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

function datePreviousYear() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // We don't need to format it to a string if we're working with MongoDB queries
  // Return the Date object directly
  return oneYearAgo;
}

exports.calculateScoreMatch = async (req, res) => {
  try {
    // const { id } = req.params;

    // // Fetch the source property using the provided ID
    // const property = await Property.findById(id);
    // if (!property) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "Property not found" });
    // }
    const { property } = req.body;

    if (!property) {
      return res
        .status(400)
        .json({ success: false, message: "Property data is required" });
    }

    const {
      latitude: sourceLat,
      longitude: sourceLon,
      suburb: sourceSuburb,
      postcode: sourcePostcode,
      propertyType: sourcePropertyType,
      developmentPotential: sourceDevelopmentPotential,
    } = property;

    // Helper function to convert degrees to radians
    function radians(degrees) {
      return degrees * (Math.PI / 180);
    }

    // Helper function to calculate the Haversine distance
    function calculateDistance(lat1, lon1, lat2, lon2) {
      const earthRadiusKm = 6371;
      const dLat = radians(lat2 - lat1);
      const dLon = radians(lon2 - lon1);
      const lat1Rad = radians(lat1);
      const lat2Rad = radians(lat2);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) *
          Math.cos(lat2Rad) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.asin(Math.sqrt(a));
      return earthRadiusKm * c;
    }

    // Function to calculate score and match properties
    const calculateMatches = async (matchedProperties) => {
      let results;

      if (sourcePropertyType === "ApartmentUnitFlat") {
        results = matchedProperties.map((targetProperty) => {
          let score = 0;
          const keyMatches = [];

          const distance = calculateDistance(
            sourceLat,
            sourceLon,
            targetProperty.latitude,
            targetProperty.longitude
          );
          if (distance <= 0.8) score += 10;
          else if (distance > 0.8 && distance <= 1.5) score += 7;
          else if (distance > 1.5 && distance <= 2.5) score += 3;

          // Building Area
          if (property.buildingArea && targetProperty.buildingArea) {
            if (
              Math.abs(property.buildingArea - targetProperty.buildingArea) <=
              10
            )
              score += 10;
            keyMatches.push("Building area");
          } else if (!property.buildingArea && !targetProperty.buildingArea) {
            score += 10;
          }

          // Bedrooms, Bathrooms, Carspaces
          if (property.bedrooms === targetProperty.bedrooms) {
            score += 40;
            keyMatches.push("Bedrooms");
          }
          if (property.bathrooms === targetProperty.bathrooms) {
            score += 5;
            keyMatches.push("Bathrooms");
          }
          if (property.carspaces === targetProperty.carspaces) {
            score += 5;
            keyMatches.push("Carspaces");
          }

          if (property.wallMaterial === targetProperty.wallMaterial) {
            score += 7;
            keyMatches.push("Wall material");
          }

          // Scoring logic for water views
          if (
            property.waterViews === "No" &&
            targetProperty.waterViews === "No"
          ) {
            score += 4; // Both have "No" water views
          } else if (property.waterViews === targetProperty.waterViews) {
            score += 10; // Identical water views (not "No")
            keyMatches.push("Water views");
          } else if (
            property.waterViews !== null &&
            targetProperty.waterViews !== null &&
            property.waterViews !== "No" &&
            targetProperty.waterViews !== "No"
          ) {
            score += 5; // Different water views, but neither is "No"
            keyMatches.push("Water views");
          }

          if (property.finishes === targetProperty.finishes) {
            score += 10;
            keyMatches.push("Finishes");
          }

          if (property.streetTraffic === targetProperty.streetTraffic) {
            score += 7;
            keyMatches.push("Street traffic");
          }

          const finalScore = score;
          return finalScore > 70
            ? { property: targetProperty, score: finalScore, keyMatches }
            : null;
        });
      } else {
        // Logic for properties other than "ApartmentUnitFlat"
        results = matchedProperties.map((targetProperty) => {
          let score = 0;
          const keyMatches = [];

          const distance = calculateDistance(
            sourceLat,
            sourceLon,
            targetProperty.latitude,
            targetProperty.longitude
          );
          if (distance <= 0.8) score += 10;
          else if (distance > 0.8 && distance <= 1.5) score += 7;
          else if (distance > 1.5 && distance <= 2.5) score += 3;

          // Land Area
          if (property.landArea && targetProperty.landArea) {
            if (Math.abs(property.landArea - targetProperty.landArea) <= 100)
              score += 10;
            keyMatches.push("Land area");
          } else if (!property.landArea && !targetProperty.landArea) {
            score += 10;
          }

          // Frontage
          if (property.frontage && targetProperty.frontage) {
            if (Math.abs(property.frontage - targetProperty.frontage) <= 50)
              score += 4;
            keyMatches.push("Frontage");
          } else if (!property.frontage && !targetProperty.frontage) {
            score += 4;
          }

          // Bedrooms, Bathrooms, Carspaces
          if (targetProperty.bedrooms === property.bedrooms) {
            score += 7;
            keyMatches.push("Bedrooms");
          }
          if (property.bathrooms === targetProperty.bathrooms) {
            score += 3;
            keyMatches.push("Bathrooms");
          }
          if (property.carspaces === targetProperty.carspaces) {
            score += 3;
            keyMatches.push("Carspaces");
          }

          // Define the scoring logic for buildType comparison
          const buildTypeSource = property.buildType;
          const buildTypeTarget = targetProperty.buildType;

          if (buildTypeSource === buildTypeTarget) {
            score += 7;
          } else if (
            (buildTypeSource === "2 storey" &&
              buildTypeTarget === "3 storey") ||
            (buildTypeSource === "2 storey" &&
              buildTypeTarget === "4+ storey") ||
            (buildTypeSource === "3 storey" &&
              buildTypeTarget === "2 storey") ||
            (buildTypeSource === "3 storey" &&
              buildTypeTarget === "4+ storey") ||
            (buildTypeSource === "4+ storey" &&
              buildTypeTarget === "2 storey") ||
            (buildTypeSource === "4+ storey" && buildTypeTarget === "3 storey")
          ) {
            score += 4;
          }

          if (property.wallMaterial === targetProperty.wallMaterial) {
            score += 7;
            keyMatches.push("Wall material");
          }

          // Pool
          if (property.pool === "Yes" && targetProperty.pool === "Yes") {
            score += 7;
            keyMatches.push("Pool");
          }
          if (property.pool === "No" && targetProperty.pool === "No") {
            score += 7;
          }

          // Tennis Court
          if (
            property.tennisCourt === "Yes" &&
            targetProperty.tennisCourt === "Yes"
          ) {
            score += 3;
            keyMatches.push("Tennis Court");
          }
          if (
            property.tennisCourt === "No" &&
            targetProperty.tennisCourt === "No"
          ) {
            score += 3;
          }

          if (property.grannyFlat === targetProperty.grannyFlat) {
            if (
              property.grannyFlat === "Yes" &&
              targetProperty.grannyFlat === "Yes"
            ) {
              score += 10;
              keyMatches.push("Granny flat");
            } else {
              score += 7;
            }
          }

          if (property.finishes === targetProperty.finishes) {
            score += 7;
            keyMatches.push("Finishes");
          }

          if (property.streetTraffic === targetProperty.streetTraffic) {
            score += 7;
            keyMatches.push("Street traffic");
          }

          if (
            property.developmentPotential === null &&
            targetProperty.developmentPotential === null
          ) {
            score += 7;
          }
          if (
            property.developmentPotential !== null &&
            targetProperty.developmentPotential !== null
          ) {
            score += 7;
          }

          // Topography
          const topographyMatch = property.topography?.every((item) =>
            targetProperty.topography?.includes(item)
          );
          if (topographyMatch) {
            score += 7;
            if (
              property.topography.length > 0 &&
              targetProperty.topography.length > 0
            ) {
              keyMatches.push("Topography");
            }
          }

          if (
            buildTypeSource !== "1 storey" &&
            buildTypeTarget === "1 storey" &&
            targetProperty.finishes !== "High-end finishes"
          ) {
            score = 0;
          }

          if (property.bedrooms === 3) {
            if (targetProperty.bedrooms < 3 || targetProperty.bedrooms > 4) {
              score = 0; // No match
            }
          } else if (property.bedrooms === 4) {
            if (targetProperty.bedrooms < 3 || targetProperty.bedrooms > 5) {
              score = 0; // No match
            }
          } else if (property.bedrooms === 5) {
            if (targetProperty.bedrooms < 4 || targetProperty.bedrooms > 7) {
              score = 0; // No match
            }
          } else if (property.bedrooms === 6) {
            if (targetProperty.bedrooms < 5 || targetProperty.bedrooms > 7) {
              score = 0; // No match
            }
          } else if (property.bedrooms >= 7) {
            if (targetProperty.bedrooms < 5) {
              score = 0; // No match
            }
          }

          // Scoring logic for water views
          if (
            property.waterViews === "No" &&
            targetProperty.waterViews === "No"
          ) {
            score += 4; // Both have "No" water views
          } else if (
            (property.waterViews === "Waterviews" &&
              targetProperty.waterViews === "Waterfront reserve") ||
            (property.waterViews === "Waterfront reserve" &&
              targetProperty.waterViews === "Waterviews")
          ) {
            score += 10; // Waterviews and Waterfront reserve are considered a match
            keyMatches.push("Water aspect");
          } else if (
            property.waterViews === targetProperty.waterViews &&
            (property.waterViews === "Waterviews" ||
              property.waterViews === "Waterfront reserve")
          ) {
            score += 10; // Identical "Waterviews" or "Waterfront reserve"
            keyMatches.push("Water aspect");
          } else if (
            (property.waterViews === "Deep waterfront with jetty" &&
              targetProperty.waterViews === "Tidal waterfront with jetty") ||
            (property.waterViews === "Tidal waterfront with jetty" &&
              targetProperty.waterViews === "Deep waterfront with jetty")
          ) {
            score += 10; // Deep waterfront with jetty and Tidal waterfront with jetty are considered a match
            keyMatches.push("Water aspect");
          } else if (
            property.waterViews === targetProperty.waterViews &&
            (property.waterViews === "Deep waterfront with jetty" ||
              property.waterViews === "Tidal waterfront with jetty")
          ) {
            score += 10; // Deep waterfront with jetty and Tidal waterfront with jetty are considered a match
            keyMatches.push("Water aspect");
          } else {
            score = 0; // Water views don't match any conditions
          }

          const finalScore = score;
          return finalScore > 70
            ? { property: targetProperty, score: finalScore, keyMatches }
            : null;
        });
      }
      // Filter out null values
      return results.filter((result) => result !== null);
    };

    // Initial suburb-based query
    let matchedProperties = await Property.aggregate([
      {
        $match: {
          suburb: sourceSuburb,
          propertyType: sourcePropertyType,
          developmentPotential:
            sourceDevelopmentPotential === null ? null : { $ne: null },
          listingId: { $ne: property.listingId },
          $or: [
            { dateListed: { $gte: datePreviousYear() } },
            { dateListed: null },
          ],
        },
      },
    ]);

    let results = await calculateMatches(matchedProperties);

    let recommendedSales = results.filter(
      (result) => result.property.listingType === "Sale"
    );
    let recommendedSold = results.filter(
      (result) => result.property.listingType === "Sold"
    );

    if (recommendedSales.length < 3) {
      matchedProperties = await Property.aggregate([
        {
          $match: {
            postcode: sourcePostcode,
            propertyType: sourcePropertyType,
            developmentPotential:
              sourceDevelopmentPotential === null ? null : { $ne: null },
            listingId: { $ne: property.listingId },
            listingType: "Sale",
            $or: [
              { dateListed: { $gte: datePreviousYear() } },
              { dateListed: null },
            ],
          },
        },
      ]);

      // Calculate matches for postcode-based properties
      recommendedSales = await calculateMatches(matchedProperties);
    }

    if (recommendedSold.length < 3) {
      matchedProperties = await Property.aggregate([
        {
          $match: {
            postcode: sourcePostcode,
            propertyType: sourcePropertyType,
            developmentPotential:
              sourceDevelopmentPotential === null ? null : { $ne: null },
            listingId: { $ne: property.listingId },
            listingType: "Sold",
            $or: [
              { dateListed: { $gte: datePreviousYear() } },
              { dateListed: null },
            ],
          },
        },
      ]);

      // Calculate matches for postcode-based properties
      recommendedSold = await calculateMatches(matchedProperties);
    }

    recommendedSales = recommendedSales.sort((a, b) => b.score - a.score);

    recommendedSold = recommendedSold.sort((a, b) => b.score - a.score);

    const systemPrompt = `Return response in json format {logicalPrice:"",logicalReasoning:"}`;
    const userInput = `You are an expert in pricing property and use recent sales comparable data, which I will give you to price property. I will give you an address and you will give me an accurate indication of its value. You will also determine the best price to list to generate the most amount of enquiry. You will observe below property features (most important is if developmentPotential is present that is increase up the price). You are to give us a range within 10%. You will give us the range like this in million format for example: $low(decimalNo)-high(decimalNo)M (e.g, $2-2.2M: Exactly a 10% difference.) [range should be within 10% means difference between low high only 10%]. No explanation or description is needed.

    Here is the property:
      
    Address: ${property.address}
    Property type: ${property.propertyType}
    ${property.landArea ? `Land area: ${property.landArea}` : ""}
    ${property.frontage ? `Frontage: ${property.frontage}` : ""}
    ${property.buildingArea ? `Building area: ${property.buildingArea}` : ""}
    Beds: ${property.bedrooms}
    Bath: ${property.bathrooms}
    Car spaces: ${property.carspaces}
    Topography: ${property.topography}
    Construction: ${property.buildType}
    Wall Material: ${property.wallMaterial}
    Pool: ${property.pool}
    Tennis Court: ${property.tennisCourt}
    Water views: ${property.waterViews}
    Street traffic: ${property.streetTraffic}
    Finishes: ${property.finishes}
    Granny Flat: ${property.grannyFlat}
    ${
      property.developmentPotential
        ? `Development Potential: ${property.developmentPotential}`
        : ""
    }
    ${
      property.additionalInformation
        ? `Additional Information: ${property.additionalInformation}`
        : ""
    }
    
    Now, find an estimate for this property using the following comparable sales:
    
    Recent properties that have been sold:
    
    ${recommendedSold
      .slice(0, 4)
      .map(
        (comp) => `
    Address: ${comp.property.address}
    Property type: ${comp.property.propertyType}
    Price: ${comp.property.price}
    ${comp.property.landArea ? `Land area: ${comp.property.landArea}` : ""}
    ${comp.property.frontage ? `Frontage: ${comp.property.frontage}` : ""}
    ${
      comp.property.buildingArea
        ? `Building area: ${comp.property.buildingArea}`
        : ""
    }
    Beds: ${comp.property.bedrooms}
    Bath: ${comp.property.bathrooms}
    Car spaces: ${comp.property.carspaces}
    Topography: ${comp.property.topography}
    Construction: ${comp.property.buildType}
    Wall Material: ${comp.property.wallMaterial}
    Pool: ${comp.pool}
    Tennis Court: ${comp.tennisCourt}
    Water views: ${comp.property.waterViews}
    Street traffic: ${comp.property.streetTraffic}
    Finishes: ${comp.property.finishes}
    Granny Flat: ${comp.property.grannyFlat}
    ${
      comp.property.developmentPotential
        ? `Development Potential: ${comp.property.developmentPotential}`
        : ""
    }
    ${
      comp.property.additionalInformation
        ? `Additional Information: ${comp.property.additionalInformation}`
        : ""
    }
    `
      )
      .join("\n")}
    
    After finding the logical price, you have to give logical reasoning in one paragraph for that property.`;

    const logical = await chatCompletion(
      systemPrompt,
      userInput,
      (jsonFormat = true)
    );

    const prompt = await Prompt.findOne({
      name: "POSTLIST_PROMPT_ENGAGED_PURCHASER",
    });
    const engagedPurchaser = await chatCompletion(
      prompt?.description,
      `Here is the property:
      
    Address: ${property.address}
    Property type: ${property.propertyType}
    ${property.landArea ? `Land area: ${property.landArea}` : ""}
    ${property.frontage ? `Frontage: ${property.frontage}` : ""}
    ${property.buildingArea ? `Building area: ${property.buildingArea}` : ""}
    Beds: ${property.bedrooms}
    Bath: ${property.bathrooms}
    Car spaces: ${property.carspaces}
    Topography: ${property.topography}
    Construction: ${property.buildType}
    Wall Material: ${property.wallMaterial}
    Pool: ${property.pool}
    Tennis Court: ${property.tennisCourt}
    Water views: ${property.waterViews}
    Street traffic: ${property.streetTraffic}
    Finishes: ${property.finishes}
    Granny Flat: ${property.grannyFlat}
    ${
      property.developmentPotential
        ? `Development Potential: ${property.developmentPotential}`
        : ""
    }
    ${
      property.additionalInformation
        ? `Additional Information: ${property.additionalInformation}`
        : ""
    }`,
      (jsonFormat = false)
    );

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentAreaSoldProcessQuery = {
      suburb: property.suburb,
      dateListed: { $gte: sixMonthsAgo }, // Last 6 months
      listingId: { $ne: property.listingId }, // Not equal to property.listingId
      beleefSaleProcess: {
        $in: ["Private treaty adjustment", "Not sold at auction", "Withdrawn"],
      },
      listingType: "Sold",
    };

    const currentAreaProcessQuery = {
      suburb: property.suburb,
      dateListed: { $gte: sixMonthsAgo }, // Last 6 months
      listingId: { $ne: property.listingId }, // Not equal to property.listingId
      beleefSaleProcess: {
        $in: ["Private treaty adjustment", "Not sold at auction", "Withdrawn"],
      },
      listingType: "Sale",
    };

    const duplexPropertiesQuery = {
      propertyType: "Duplex",
      suburb: { $regex: new RegExp(`^${property.suburb}$`, "i") },
      dateListed: { $gte: sixMonthsAgo }, // Last 6 months
      listingId: { $ne: property.listingId }, // Not equal to property.listingId
      listingType: "Sold",
    };

    const recentAreaSoldProcess = await Property.find(
      recentAreaSoldProcessQuery
    );
    const currentAreaProcess = await Property.find(currentAreaProcessQuery);
    const duplexProperties = await Property.find(duplexPropertiesQuery).sort({
      price: -1,
    });

    return res.status(200).json({
      success: true,
      data: {
        logical,
        recommendedSales,
        recommendedSold,
        recentAreaSoldProcess,
        currentAreaProcess,
        duplexProperties,
        engagedPurchaser,
      },
    });
  } catch (error) {
    console.error("Error in user calculateScoreMatch API: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAreaDynamics = async (req, res) => {
  try {
    const { suburb } = req.params; // Suburb comes from the request params

    // Find the suburb document
    const suburbData = await Suburb.findOne({
      suburb: { $regex: new RegExp(suburb, "i") },
    });

    if (!suburbData) {
      return res.status(404).json({
        success: false,
        message: `No data found for suburb ${suburb}`,
      });
    }

    // Get the maximum year from both houseStats and unitStats
    const houseYears = suburbData.houseStats.map((stat) => stat.year);
    const unitYears = suburbData.unitStats.map((stat) => stat.year);

    const maxHouseYear = houseYears.length > 0 ? Math.max(...houseYears) : null;
    const maxUnitYear = unitYears.length > 0 ? Math.max(...unitYears) : null;

    // Filter the houseStats and unitStats for the max year
    const houseStats = suburbData.houseStats.find(
      (stat) => stat.year === maxHouseYear
    );
    const unitStats = suburbData.unitStats.find(
      (stat) => stat.year === maxUnitYear
    );

    // Return the stats for the maximum year
    return res.status(200).json({
      success: true,
      data: { houseStats, unitStats },
    });
  } catch (error) {
    console.error("Error fetching area dynamics data: ", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getBeleefSaleProcess = async (req, res) => {
  try {
    const { suburb } = req.params; // Suburb comes from the request params

    const saleProcesses = await Property.aggregate([
      {
        $match: {
          suburb: { $regex: new RegExp(`^${suburb}$`, "i") }, // Case-insensitive matching for suburb
          beleefSaleProcess: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$beleefSaleProcess", // Group by beleefSaleProcess
          count: { $sum: 1 }, // Count occurrences
        },
      },
    ]);

    // Convert the result to the desired format
    const formattedResult = saleProcesses.reduce((acc, process) => {
      acc[process._id] = process.count;
      return acc;
    }, {});

    // Send the response
    res.status(200).json({
      success: true,
      data: formattedResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.regenerateLogicalPrice = async (req, res) => {
  try {
    const { property, checkedProperties } = req.body;

    if (!property || !checkedProperties || checkedProperties.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Property data and checkedProperties are required",
      });
    }

    // Function to format the checked properties for the prompt
    const formatCheckedProperties = (properties) => {
      return properties
        .map(
          (comp) => `
    Address: ${comp.property.address}
    Property type: ${comp.property.propertyType}
    Price: ${comp.property.price}
    ${comp.property.landArea ? `Land area: ${comp.property.landArea}` : ""}
    ${comp.property.frontage ? `Frontage: ${comp.property.frontage}` : ""}
    ${
      comp.property.buildingArea
        ? `Building area: ${comp.property.buildingArea}`
        : ""
    }
    Beds: ${comp.property.bedrooms}
    Bath: ${comp.property.bathrooms}
    Car spaces: ${comp.property.carspaces}
    Topography: ${comp.property.topography}
    Construction: ${comp.property.buildType}
    Wall Material: ${comp.property.wallMaterial}
    Pool: ${comp.pool}
    Tennis Court: ${comp.tennisCourt}
    Water views: ${comp.property.waterViews}
    Street traffic: ${comp.property.streetTraffic}
    Finishes: ${comp.property.finishes}
    Granny Flat: ${comp.property.grannyFlat}
    ${
      comp.property.developmentPotential
        ? `Development Potential: ${comp.property.developmentPotential}`
        : ""
    }
    ${
      comp.property.additionalInformation
        ? `Additional Information: ${comp.property.additionalInformation}`
        : ""
    }
        `
        )
        .join("\n");
    };

    const systemPrompt = `Return response in json format {logicalPrice:"",logicalReasoning:"}`;
    const userInput = `You are an expert in pricing property and use recent sales comparable data, which I will give you to price property. I will give you an address and you will give me an accurate indication of its value. You will also determine the best price to list to generate the most amount of enquiry. You will observe below property features. You are to give us a range within 10%. You will give us the range like this in million format for example: $low(decimalNo)-high(decimalNo)M (e.g, $2-2.2M: Exactly a 10% difference.) [range should be within 10% means difference between low high only 10%]. No explanation or description is needed.

    Here is the property:
      
    Address: ${property.address}
    Property type: ${property.propertyType}
    ${property.landArea ? `Land area: ${property.landArea}` : ""}
    ${property.frontage ? `Frontage: ${property.frontage}` : ""}
    ${property.buildingArea ? `Building area: ${property.buildingArea}` : ""}
    Beds: ${property.bedrooms}
    Bath: ${property.bathrooms}
    Car spaces: ${property.carspaces}
    Topography: ${property.topography}
    Construction: ${property.buildType}
    Wall Material: ${property.wallMaterial}
    Pool: ${property.pool}
    Tennis Court: ${property.tennisCourt}
    Water views: ${property.waterViews}
    Street traffic: ${property.streetTraffic}
    Finishes: ${property.finishes}
    Granny Flat: ${property.grannyFlat}
    ${
      property.developmentPotential
        ? `Development Potential: ${property.developmentPotential}`
        : ""
    }
    ${
      property.additionalInformation
        ? `Additional Information: ${property.additionalInformation}`
        : ""
    }
    
    Now, find an estimate for this property using the following comparable sales:
    
    Recent properties that have been sold:
    
    ${formatCheckedProperties(checkedProperties)}
    
    After finding the logical price, you have to give logical reasoning in one paragraph for that property.`;

    const logical = await chatCompletion(
      systemPrompt,
      userInput,
      (jsonFormat = true)
    );

    // Return the logical price and reasoning
    return res.status(200).json({
      success: true,
      data: logical,
    });
  } catch (error) {
    console.error("Error in regenerateLogicalPrice API: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
