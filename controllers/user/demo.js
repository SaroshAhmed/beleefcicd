const mongoose = require("mongoose");
const Demo = require("../../models/Demo");
const { DOMAIN_API_KEY } = require("../../config");
const { chatCompletion } = require("../../utils/openai");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

async function getLogicalPrice(property, recommendedSold) {
  const systemPrompt = `Return response in json format {logicalPrice:""}`;
  const userInput = `You are an expert in pricing property and use recent sales comparable data, which I will give you to price property. I will give you an address and you will give me an accurate indication of its value. You will also determine the best price to list to generate the most amount of enquiry. You will observe below property features (most important is if developmentPotential is present that is increase up the price). You are to give us a range within 10%. You will give us the range like this: if the price is more than 1 million, use million format (M) like $low(decimalNo)-high(decimalNo)M (e.g., $2-2.2M: Exactly a 10% difference). If the price is less than 1 million, use thousand format (K) like $low(decimalNo)-high(decimalNo)K (e.g., $800-880K: Exactly a 10% difference). [range should be within 10% means difference between low high only 10%]. No explanation or description is needed.

    Here is the property:
      
    Address: ${property?.address?.streetAddress || property?.address}
    Land area: ${property?.landDetails?.propertyArea || property?.landArea}
    Beds: ${property?.features?.bedrooms || property?.bedrooms}
    Bath: ${property?.features?.bathrooms || property?.bathrooms}
    Car spaces: ${property?.features?.carParks || property?.carspace}
    Pool: ${property?.features?.pool || property?.pool ? "Yes" : "No"}

    Now, find an estimate for this property using the following comparable sales:
    Recent properties that have been sold:
    
    ${recommendedSold
      .filter((property) => property.price?.value)
      .sort((a, b) => b.price.value - a.price.value)
      .slice(0, 3)
      .map(
        (property) => `
      Address: ${property.address?.streetAddress}
    Old Price: ${property.price?.value}
    Land area: ${property.landDetails?.propertyArea}
    Beds: ${property.propertyFeatures?.bedrooms}
    Bath: ${property.propertyFeatures?.bathrooms}
    Car spaces: ${property.propertyFeatures?.carParks}
    Pool: ${property.propertyFeatures?.pool ? "Yes" : "No"}
    `
      )
      .join("\n")}
    
  `;

  const logical = await chatCompletion(
    systemPrompt,
    userInput,
    (jsonFormat = true)
  );
  return logical.logicalPrice;
}

// Function to get property suggestion based on address and suburb
async function getPropertySuggestion(address, suburb) {
  try {
    const response = await axios.get(
      "https://api.pricefinder.com.au/v1/suggest/properties",
      {
        params: {
          q: address,
          match_ids: false,
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer 94bcd2cbb7a085d7b27c45aaef3d0b2`, // Use your API key
        },
      }
    );

    const matches = response.data.matches;
    if (matches && matches.length > 0) {
      const firstMatch = matches[0];

      if (firstMatch.address && firstMatch.address.locality) {
        if (
          firstMatch.address.locality.toLowerCase() === suburb.toLowerCase()
        ) {
          return firstMatch.property.id;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching property suggestion:", error);
    return null;
  }
}

// Function to get extended property details using the property ID
async function getExtendedPropertyDetails(propertyId) {
  try {
    const response = await axios.get(
      `https://api.pricefinder.com.au/v1/properties/${propertyId}/extended`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer 94bcd2cbb7a085d7b27c45aaef3d0b2`, // Use your API key
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching extended property details:", error);
    return null;
  }
}

async function getSoldMatches(suburbId, maxBed, minBed, type) {
  try {
    const response = await axios.get(
      `https://api.pricefinder.com.au/v1/suburbs/${suburbId}/sales?date_end=now&date_start=today-6m&limit=5&matchlevel_max=property&max_beds=${maxBed}&min_beds=${minBed}&property_type=${type}&sort=-date`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer 94bcd2cbb7a085d7b27c45aaef3d0b2`, // Use your API key
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching sold matches:", error);
    return null;
  }
}

async function getSuburbStats(id) {
  try {
    const response = await axios.get(
      `https://api.pricefinder.com.au/v1/suburbs/${id}/summary`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer 94bcd2cbb7a085d7b27c45aaef3d0b2`,
        },
      }
    );

    const { house, unit } = response.data || {};

    const houseStats = {
      year: 2024,
      medianSalePrice: house?.medianSalePrice || null,
      annualSalesVolume: house?.saleCount || null,
      suburbGrowth:
        house?.suburbGrowth !== undefined && house?.suburbGrowth !== null
          ? house.suburbGrowth.toFixed(2) + "%"
          : "N/A",
      highDemandArea: house?.saleCount > 130 ? "Yes" : "No",
    };

    const unitStats = {
      year: 2024,
      medianSalePrice: unit?.medianSalePrice || null,
      annualSalesVolume: unit?.saleCount || null,
      suburbGrowth:
        unit?.suburbGrowth !== undefined && unit?.suburbGrowth !== null
          ? unit.suburbGrowth.toFixed(2) + "%"
          : "N/A",
      highDemandArea: unit?.saleCount > 90 ? "Yes" : "No",
    };

    return { houseStats, unitStats };
  } catch (error) {
    console.error("Error fetching suburb stats:", error);
    return null;
  }
}

exports.createProperty = async (req, res) => {
  const { id } = req.user;
  const address = req.body.address?.toUpperCase() || "";
  const suburb = req.body.suburb?.toUpperCase() || "";

  try {
    // Check if property already exists
    const propertyExists = await Demo.findOne({ address });
    if (propertyExists) {
      return res.status(200).json({ success: true, data: propertyExists });
    }

    // Fetch property ID suggestion
    const propertyId = await getPropertySuggestion(address, suburb);
    if (propertyId) {
      // Fetch extended property details using the property ID
      const extendedData = await getExtendedPropertyDetails(propertyId);

      if (extendedData) {
        const uniqueId = uuidv4();
        // Create new property record in Demo collection
        const soldMatches = await getSoldMatches(
          extendedData.suburb.id,
          extendedData.features.bedrooms + 1,
          extendedData.features.bedrooms - 1,
          extendedData.type
        );

        const recentAreaSoldProcess = [];

        if (soldMatches.sales.length) {
          await Promise.all(
            soldMatches.sales.map(async (property) => {
              try {
                const response = await getExtendedPropertyDetails(
                  property.property.id
                );
                recentAreaSoldProcess.push({
                  saleHistory: response?.saleHistory,
                  listingHistory: response?.listingHistory,
                });
              } catch (error) {
                console.error(
                  `Error fetching details for property ID ${property.id}:`,
                  error
                );
                // Continue without stopping the loop
              }
            })
          );
        }

        const stats = await getSuburbStats(extendedData.suburb.id);
        const logicalPrice = await getLogicalPrice(
          extendedData,
          soldMatches.sales
        );

        const newProperty = await Demo.create({
          userId: id,
          propertyId: extendedData.id,
          suburbId: extendedData.suburb.id,
          address: extendedData.address.streetAddress,
          listingType: extendedData.marketStatus.forSale ? "Sale" : "Sold",
          price: extendedData.saleHistory?.sales[0]?.price?.value || null,
          postcode: extendedData.address.postcode,
          suburb: extendedData.address.locality,
          latitude: extendedData.location.lat,
          longitude: extendedData.location.lon,
          propertyType: extendedData.type,
          media: null,
          bedrooms: extendedData.features.bedrooms || 0,
          bathrooms: extendedData.features.bathrooms || 0,
          carspaces: extendedData.features.carParks || 0,
          landArea: extendedData.landDetails?.propertyArea || null,
          pool: extendedData.features.pool ? "Yes" : "No",
          tennisCourt: extendedData.features.court ? "Yes" : "No",
          dateListed:
            extendedData.saleHistory?.sales[0]?.saleDate?.value || null,
          daysListed:
            extendedData.saleHistory?.sales[0]?.listingHistory?.daysToSell ||
            null,
          logicalPrice: null,
          saleHistory: extendedData.saleHistory,
          listingHistory: extendedData.listingHistory,
          shareableLink: uniqueId,
          soldMatches,
          areaDynamics: {
            houseStats: stats.houseStats,
            unitStats: stats.unitStats,
          },
          logicalPrice,
          recentAreaSoldProcess,
        });

        return res.status(200).json({ success: true, data: newProperty });
      } else {
        return res.status(404).json({
          success: false,
          message: "Extended property details not found",
        });
      }
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Property suggestion not found" });
    }
  } catch (error) {
    console.error("Error creating property:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getPropertyByAddress = async (req, res) => {
  const address = req.params.address?.toUpperCase() || "";
  try {
    const property = await Demo.findOne({ address });

    if (property) {
      return res.status(200).json({ success: true, data: property });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
  } catch (error) {
    console.error("Error fetching property:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.regenerateLogicalPrice = async (req, res) => {
  const { property, checkedProperties } = req.body;

  try {
    // Retrieve logical price based on provided data
    const logicalPrice = await getLogicalPrice(property, checkedProperties);

    // Update the Demo collection with the new logical price for the specified address using `$set`
    const updatedProperty = await Demo.findOneAndUpdate(
      { address: property.address }, // Find property by address
      { $set: { logicalPrice: logicalPrice } } // Use `$set` to update the logicalPrice field
    );

    if (updatedProperty) {
      return res.status(200).json({ success: true, data: logicalPrice });
    }
  } catch (error) {
    console.error("Error updating logical price:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Demo.find({}, "address"); // Fetch only the address field

    return res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getPropertyByShareableLink = async (req, res) => {
  const shareableLink = req.params.shareableLink;

  try {
    const property = await Demo.findOne({ shareableLink });

    if (property) {
      return res.status(200).json({ success: true, data: property });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
  } catch (error) {
    console.error("Error fetching property by shareable link:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
