const Property = require("../../models/Property");

// Get all properties with specific fields
const getProperties = async (req, res) => {
  try {
    const properties = await Property.find(
      {},
      {
        address: 1,
        suburb: 1,
        postcode: 1,
        price: 1,
        isCleaned: 1,
        dateListed: 1,
        daysListed: 1,
        listingType: 1,
        propertyType: 1,
      }
    );

    return res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error("Error fetching properties:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get a property by ID
const getPropertyById = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findById(id);

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    return res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.error(`Error fetching property with ID ${id}:`, error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const calculateScoreMatch = async (req, res) => {
  const { id } = req.params;

  // Fetch the source property using the provided ID
  const property = await Property.findById(id);
  if (!property) {
    return res
      .status(404)
      .json({ success: false, message: "Property not found" });
  }

  const {
    latitude: sourceLat,
    longitude: sourceLon,
    suburb: sourceSuburb,
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

  // Fetch all properties in the same suburb regardless of listing type
  const matchedProperties = await Property.aggregate([
    {
      $match: {
        suburb: sourceSuburb,
        propertyType: sourcePropertyType,
        developmentPotential:
          sourceDevelopmentPotential === null ? null : { $ne: null },
        _id: { $ne: property._id },
      },
    },
  ]);

  let results;

  if (sourcePropertyType === "ApartmentUnitFlat") {
    results = matchedProperties.map((targetProperty) => {
      let score = 0;
      const keyMatches = {};

      const distance = calculateDistance(
        sourceLat,
        sourceLon,
        targetProperty.latitude,
        targetProperty.longitude
      );
      if (distance <= 0.8) {
        score += 10;
        keyMatches["Distance"] = 10;
      } else if (distance > 0.8 && distance <= 1.5) {
        score += 7;
        keyMatches["Distance"] = 7;
      } else if (distance > 1.5 && distance <= 2.5) {
        score += 3;
        keyMatches["Distance"] = 3;
      }

      // Building Area
      if (property.buildingArea && targetProperty.buildingArea) {
        if (
          Math.abs(property.buildingArea - targetProperty.buildingArea) <= 10
        ) {
          score += 10;
          keyMatches["Building area"] = 10;
        }
      } else if (!property.buildingArea && !targetProperty.buildingArea) {
        score += 10;
        keyMatches["Building area"] = 10;
      }

      // Bedrooms, Bathrooms, Carspaces
      if (property.bedrooms === targetProperty.bedrooms) {
        score += 40;
        keyMatches["Bedrooms"] = 40;
      }
      if (property.bathrooms === targetProperty.bathrooms) {
        score += 5;
        keyMatches["Bathrooms"] = 5;
      }
      if (property.carspaces === targetProperty.carspaces) {
        score += 5;
        keyMatches["Carspaces"] = 5;
      }

      if (property.wallMaterial === targetProperty.wallMaterial) {
        score += 7;
        keyMatches["Wall material"] = 7;
      }

      // Water Views
      if (property.waterViews === "No" && targetProperty.waterViews === "No") {
        score += 4;
        keyMatches["Water views"] = 4;
      } else if (property.waterViews === targetProperty.waterViews) {
        score += 10;
        keyMatches["Water views"] = 10;
      } else if (
        property.waterViews !== null &&
        targetProperty.waterViews !== null &&
        property.waterViews !== "No" &&
        targetProperty.waterViews !== "No"
      ) {
        score += 5;
        keyMatches["Water views"] = 5;
      }

      if (property.finishes === targetProperty.finishes) {
        score += 10;
        keyMatches["Finishes"] = 10;
      }

      if (property.streetTraffic === targetProperty.streetTraffic) {
        score += 7;
        keyMatches["Street traffic"] = 7;
      }

      const finalScore = score;
      return finalScore > 55
        ? { property: targetProperty, score: finalScore, keyMatches }
        : null;
    });
  } else {
    results = matchedProperties.map((targetProperty) => {
      let score = 0;
      const keyMatches = {};

      const distance = calculateDistance(
        sourceLat,
        sourceLon,
        targetProperty.latitude,
        targetProperty.longitude
      );
      if (distance <= 0.8) {
        score += 10;
        keyMatches["Distance"] = 10;
      } else if (distance > 0.8 && distance <= 1.5) {
        score += 7;
        keyMatches["Distance"] = 7;
      } else if (distance > 1.5 && distance <= 2.5) {
        score += 3;
        keyMatches["Distance"] = 3;
      }

      // Land Area
      if (property.landArea && targetProperty.landArea) {
        if (Math.abs(property.landArea - targetProperty.landArea) <= 100) {
          score += 10;
          keyMatches["Land area"] = 10;
        }
      } else if (!property.landArea && !targetProperty.landArea) {
        score += 10;
        keyMatches["Land area"] = 10;
      }

      // Frontage
      if (property.frontage && targetProperty.frontage) {
        if (Math.abs(property.frontage - targetProperty.frontage) <= 50) {
          score += 4;
          keyMatches["Frontage"] = 4;
        }
      } else if (!property.frontage && !targetProperty.frontage) {
        score += 4;
        keyMatches["Frontage"] = 4;
      }

      // Bedrooms, Bathrooms, Carspaces
      if (property.bedrooms === targetProperty.bedrooms) {
        score += 5;
        keyMatches["Bedrooms"] = 5;
      }
      if (property.bathrooms === targetProperty.bathrooms) {
        score += 3;
        keyMatches["Bathrooms"] = 3;
      }
      if (property.carspaces === targetProperty.carspaces) {
        score += 3;
        keyMatches["Carspaces"] = 3;
      }

      // Build Type
      const buildTypeSource = property.buildType;
      const buildTypeTarget = targetProperty.buildType;

      if (buildTypeSource === buildTypeTarget) {
        score += 7;
        keyMatches["Build type"] = 7;
      } else if (
        (buildTypeSource === "2 storey" && buildTypeTarget === "3 storey") ||
        (buildTypeSource === "2 storey" && buildTypeTarget === "4+ storey") ||
        (buildTypeSource === "3 storey" && buildTypeTarget === "2 storey") ||
        (buildTypeSource === "3 storey" && buildTypeTarget === "4+ storey") ||
        (buildTypeSource === "4+ storey" && buildTypeTarget === "2 storey") ||
        (buildTypeSource === "4+ storey" && buildTypeTarget === "3 storey")
      ) {
        score += 4;
        keyMatches["Build type"] = 4;
      }

      if (property.wallMaterial === targetProperty.wallMaterial) {
        score += 7;
        keyMatches["Wall material"] = 7;
      }

      // Pool
      const hasPoolSource =
        property.features?.includes("SwimmingPool") || false;
      const hasPoolTarget =
        targetProperty.features?.includes("SwimmingPool") || false;
      if (hasPoolSource === hasPoolTarget) {
        score += 7;
        if (hasPoolSource && hasPoolTarget) {
          keyMatches["Pool"] = 7;
        }
      }

      // Tennis Court
      const hasTennisCourtSource =
        property.features?.includes("TennisCourt") || false;
      const hasTennisCourtTarget =
        targetProperty.features?.includes("TennisCourt") || false;
      if (hasTennisCourtSource === hasTennisCourtTarget) {
        score += 3;
        if (hasTennisCourtSource && hasTennisCourtTarget) {
          keyMatches["Tennis court"] = 3;
        }
      }

      // Water Views
      if (property.waterViews === "No" && targetProperty.waterViews === "No") {
        score += 4;
        keyMatches["Water views"] = 4;
      } else if (property.waterViews === targetProperty.waterViews) {
        score += 10;
        keyMatches["Water views"] = 10;
      } else if (
        property.waterViews !== null &&
        targetProperty.waterViews !== null &&
        property.waterViews !== "No" &&
        targetProperty.waterViews !== "No"
      ) {
        score += 5;
        keyMatches["Water views"] = 5;
      }

      if (property.grannyFlat === targetProperty.grannyFlat) {
        score += 7;
        if (
          property.grannyFlat === "Yes" &&
          targetProperty.grannyFlat === "Yes"
        ) {
          keyMatches["Granny flat"] = 7;
        }
      }

      if (property.finishes === targetProperty.finishes) {
        score += 7;
        keyMatches["Finishes"] = 7;
      }

      if (property.streetTraffic === targetProperty.streetTraffic) {
        score += 7;
        keyMatches["Street traffic"] = 7;
      }

      if (
        property.developmentPotential === null &&
        targetProperty.developmentPotential === null
      ) {
        score += 7;
        keyMatches["Development potential"] = 7;
      }
      if (
        property.developmentPotential !== null &&
        targetProperty.developmentPotential !== null
      ) {
        score += 7;
        keyMatches["Development potential"] = 7;
      }

      // Topography
      const topographyMatch = property.topography?.every((item) =>
        targetProperty.topography?.includes(item)
      );
      if (topographyMatch) {
        score += 7;
        keyMatches["Topography"] = 7;
      }

      if (
        buildTypeSource !== "1 storey" &&
        buildTypeTarget === "1 storey" &&
        targetProperty.finishes !== "High-end finishes"
      ) {
        score = 0;
      }

      const finalScore = score;
      return finalScore > 55
        ? { property: targetProperty, score: finalScore, keyMatches }
        : null;
    });
  }

  // Filter out null values and separate by listing type
  const validResults = results.filter((result) => result !== null);
  const recommendedSales = validResults.filter(
    (result) => result.property.listingType === "Sale"
  );
  const recommendedSold = validResults.filter(
    (result) => result.property.listingType === "Sold"
  );

  return res
    .status(200)
    .json({ success: true, data: { recommendedSales, recommendedSold } });
};

module.exports = {
  getProperties,
  getPropertyById,
  calculateScoreMatch,
};
