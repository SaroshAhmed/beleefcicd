const UserProperty = require("../../models/UserProperty");
const Property = require("../../models/Property");

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
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getUserPropertyByAddress = async (req, res) => {
  try {
    const { id } = req.user;
    const { address } = req.params;

    const userProperty = await UserProperty.findOne({
      userId: id,
      address: { $regex: new RegExp(address, "i") }
    });

    return res.status(200).json({ success: true, data: userProperty });
  } catch (error) {
    console.error("Error in getPropertyByAddress: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getPropertyByAddress = async (req, res) => {
  try {
    const { address } = req.params;

    const property = await Property.findOne({
      address: { $regex: new RegExp(address, "i") }
    });

    return res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.error("Error in getPropertyByAddress: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.calculateScoreMatch = async (req, res) => {
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
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

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
          if (Math.abs(property.buildingArea - targetProperty.buildingArea) <= 10)
            score += 9;
          keyMatches.push("Floor area");
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

        // Water Views
        if (property.waterViews === "No" && targetProperty.waterViews === "No") {
          score += 4;
        } else if (property.waterViews === targetProperty.waterViews) {
          score += 10;
          keyMatches.push("Water views");
        } else if (property.waterViews && targetProperty.waterViews) {
          score += 5;
        }

        if (property.finishes === targetProperty.finishes) {
          score += 7;
          keyMatches.push("Finishes");
        }

        if (property.streetTraffic === targetProperty.streetTraffic) {
          score += 7;
          keyMatches.push("Street traffic");
        }

        const finalScore = score;
        return finalScore > 55
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
            score += 7;
          keyMatches.push("Land area");
        }

        // Frontage
        if (property.frontage && targetProperty.frontage) {
          if (Math.abs(property.frontage - targetProperty.frontage) <= 50)
            score += 4;
          keyMatches.push("Frontage");
        }

        // Other comparisons (Bedrooms, Bathrooms, etc.)
        if (property.bedrooms === targetProperty.bedrooms) {
          score += 3;
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

        if (property.buildType === targetProperty.buildType) {
          score += 7;
        }

        const finalScore = score;
        return finalScore > 55
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
        developmentPotential: sourceDevelopmentPotential === null ? null : { $ne: null },
        _id: { $ne: property._id },
      },
    },
  ]);

  // Calculate matches for suburb-based properties
  let results = await calculateMatches(matchedProperties);

  // Filter by listing type
  let recommendedSales = results.filter(
    (result) => result.property.listingType === "Sale"
  );
  let recommendedSold = results.filter(
    (result) => result.property.listingType === "Sold"
  );

  // If recommendedSales or recommendedSold is less than 3, rerun with postcode-based query
  if (recommendedSales.length < 3 || recommendedSold.length < 3) {
    matchedProperties = await Property.aggregate([
      {
        $match: {
          postcode: sourcePostcode,
          propertyType: sourcePropertyType,
          developmentPotential: sourceDevelopmentPotential === null ? null : { $ne: null },
          _id: { $ne: property._id },
        },
      },
    ]);

    // Calculate matches for postcode-based properties
    results = await calculateMatches(matchedProperties);

    // Filter by listing type again
    recommendedSales = results.filter(
      (result) => result.property.listingType === "Sale"
    );
    recommendedSold = results.filter(
      (result) => result.property.listingType === "Sold"
    );
  }

  return res
    .status(200)
    .json({ success: true, data: { recommendedSales, recommendedSold } });
};
