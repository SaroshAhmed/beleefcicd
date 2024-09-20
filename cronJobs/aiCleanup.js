const Property = require("../models/Property");
const UserProperty = require("../models/UserProperty");
const cron = require("node-cron");
const { DOMAIN_API_KEY } = require("../config");
const { analyzeImagesAIUrls, mapAerialImgAnalyze } = require("../utils/openai");
const axios = require("axios");
const { getMapStaticImage } = require("../utils/maps");

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
      !propertyType?.startsWith("Apartment") && landArea === null
        ? "Extract landArea value from the description or headline only. Do not confuse with internal area or internal space that is different thing. Do not give a range. Its value should be number type. If not present then put null"
        : landArea,
    buildingArea:
      propertyType?.startsWith("Apartment") && buildingArea === null
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
    .slice(0, 2)
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

// Function to retry AI analysis
const retryAIAnalysis = async (data, maxRetries = 3) => {
  let attempts = 0;
  let aiResult = null;
  while (attempts < maxRetries) {
    try {
      aiResult = await generatePromptAndAnalyze(data);
      console.log(aiResult);
      if (aiResult) break; // If AI is successful, break out of loop
    } catch (error) {
      console.error(
        `Error analyzing propertyId ${data.propertyId} on attempt ${
          attempts + 1
        }:`,
        error.message
      );
    }
    attempts += 1;
  }
  if (!aiResult) {
    throw new Error("Failed to generate AI analysis after multiple attempts");
  }
  return aiResult;
};

// Flag to prevent overlapping executions
let isJobRunning = false;

// Cron Job Setup
const startPropertyUpdaterCron = () => {
  cron.schedule(
    "*/5 * * * * *", // Runs every 5 seconds
    async () => {
      if (isJobRunning) {
        console.log("Previous job is still running. Skipping this run.");
        return;
      }

      isJobRunning = true;
      console.log("Cron job started at:", new Date().toISOString());

      try {
        // Fetch properties that are not yet cleaned
        const properties = await Property.find({
          isCleaned: false,
          fetchMode: "manual", // Assuming you want to filter by fetchMode as well
        });

        if (!properties || properties.length === 0) {
          console.log("No properties to process.");
          isJobRunning = false;
          return;
        }

        for (const property of properties) {
          const { _id, address, suburb, postcode, latitude, longitude } =
            property;

          const fullAddress = `${address} NSW`;

          try {
            if (!latitude || !longitude) {
              const data = {
                address: address.replace(/,? NSW.*$/, ""),
                listingType: "Sale",
                price: null,
                postcode: postcode || null,
                suburb: suburb?.toUpperCase(),
                channel: "residential",
                fetchMode: "manual",
                isCleaned: true, // Mark as cleaned
              };
              await Property.updateOne({ _id }, { $set: data });
              await updateUserPropertyDocuments(_id, data);
              console.log(
                `Property ${_id} updated successfully (No Domain API match).`
              );
              continue;
            }

            const response = await axios.get(
              `https://api.domain.com.au/v1/properties/_suggest?terms=${encodeURIComponent(
                fullAddress
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
              Array.isArray(response.data) &&
              response.data.length > 0 &&
              response.data[0]?.address
                ?.toLowerCase()
                .includes(suburb.toLowerCase()) &&
              response.data[0]?.relativeScore === 100 &&
              address?.toLowerCase().split(" ").slice(0, 3).join(" ") ===
                response.data[0]?.address
                  ?.toLowerCase()
                  .split(" ")
                  .slice(0, 3)
                  .join(" ")
            ) {
              const propertyId = response.data[0].id;

              // Fetch property details
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

              const listingId = propertyDetails?.photos?.[0]?.advertId;

              if (!listingId) {
                console.log("no listing id");
                // No listingId found, proceed with AI analysis and property creation
                const imageBuffer = await getMapStaticImage(
                  propertyDetails?.addressCoordinate.lat,
                  propertyDetails?.addressCoordinate.lon
                );
                const aiResponse = await mapAerialImgAnalyze(imageBuffer);

                const data = {
                  address: propertyDetails?.address.replace(/,? NSW.*$/, ""),
                  listingType: "Sale",
                  price: null,
                  waterViews: aiResponse.waterViews,
                  pool: aiResponse.pool,
                  tennisCourt: aiResponse.tennisCourt,
                  streetTraffic: aiResponse.streetTraffic,
                  topography: aiResponse.topography,
                  postcode: propertyDetails?.postcode,
                  suburb: propertyDetails?.suburb?.toUpperCase(),
                  latitude: propertyDetails?.addressCoordinate.lat,
                  longitude: propertyDetails?.addressCoordinate.lon,
                  propertyType: propertyDetails?.propertyType,
                  bedrooms: propertyDetails?.bedrooms || null,
                  bathrooms: propertyDetails?.bathrooms || null,
                  carspaces: propertyDetails?.carspaces || null,
                  landArea:
                    propertyDetails?.propertyType !== "Apartment"
                      ? propertyDetails?.areaSize
                      : null,
                  buildingArea:
                    propertyDetails?.propertyType === "Apartment"
                      ? propertyDetails?.areaSize
                      : null,
                  features: propertyDetails?.features,
                  propertyId,
                  channel: "residential",
                  urlSlug: propertyDetails.urlSlug,
                  canonicalUrl: propertyDetails.canonicalUrl,
                  fetchMode: "manual",
                  isCleaned: true, // Mark as cleaned
                };
                await Property.updateOne({ _id }, { $set: data });

                await updateUserPropertyDocuments(_id, data);
                console.log(`Property ${_id} updated successfully.`);
                continue; // Move to the next property
              }

              // Attempt to fetch listing details
              let listingDetails;
              try {
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
                listingDetails = lResponse.data;
              } catch (error) {
                console.log("listing Id exists but Not Found 404 error");
                if (error.response && error.response.status === 404) {
                  // Handle 404 error by constructing the alternative data object
                  const data = {
                    listingId,
                    address: propertyDetails?.address.replace(/,? NSW.*$/, ""),
                    listingType: "Sale",
                    beleefSaleProcess:
                      propertyDetails?.status === "OffMarket"
                        ? "Withdrawn"
                        : null,
                    postcode: propertyDetails?.postcode,
                    suburb: propertyDetails?.suburb?.toUpperCase(),
                    latitude: propertyDetails?.addressCoordinate.lat,
                    longitude: propertyDetails?.addressCoordinate.lon,
                    propertyType: propertyDetails?.propertyType,
                    bedrooms: propertyDetails?.bedrooms || null,
                    bathrooms: propertyDetails?.bathrooms || null,
                    carspaces: propertyDetails?.carspaces || null,
                    landArea:
                      propertyDetails?.propertyType !== "Apartment"
                        ? propertyDetails?.areaSize
                        : null,
                    buildingArea:
                      propertyDetails?.propertyType === "Apartment"
                        ? propertyDetails?.areaSize
                        : null,
                    features: propertyDetails?.features,
                    media:
                      Array.isArray(propertyDetails?.photos) &&
                      propertyDetails.photos.length > 0
                        ? propertyDetails.photos.map((photo) => ({
                            category: "Image",
                            type: photo.imageType,
                            url: photo.fullUrl,
                          }))
                        : [],
                    channel: "residential",
                    fetchMode: "manual",
                    isCleaned: true,
                  };

                  // Create the property with the alternative data
                  await Property.updateOne({ _id }, { $set: data });
                  await updateUserPropertyDocuments(_id, data);
                  console.log(
                    `Property ${_id} updated successfully (404 handled).`
                  );
                  continue; // Move to the next property
                } else {
                  // For other errors, log and skip this property
                  console.error(
                    `Error fetching listing details for property ${_id}:`,
                    error.message
                  );
                  continue; // Move to the next property
                }
              }

              // If listing details are successfully fetched, proceed as usual
              const daysListed = listingDetails.saleDetails?.soldDetails
                ?.soldDate
                ? calculateDaysListed(
                    listingDetails.dateListed,
                    listingDetails.saleDetails?.soldDetails?.soldDate
                  )
                : null;

              const data = {
                listingId,
                address: propertyDetails?.address.replace(/,? NSW.*$/, ""),
                listingType:
                  listingDetails.saleMode === "sold" ? "Sold" : "Sale",
                price:
                  listingDetails.saleDetails?.soldDetails?.soldPrice || null,
                postcode: listingDetails.addressParts.postcode,
                suburb: listingDetails.addressParts.suburb?.toUpperCase(),
                latitude: listingDetails?.geoLocation?.latitude,
                longitude: listingDetails?.geoLocation?.longitude,
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
                dateListed: listingDetails?.dateListed,
                daysListed,
                propertyId,
                media: listingDetails?.media, // Ensure media is properly formatted
                headline: listingDetails?.headline,
                description: listingDetails?.description,
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

              // Get AI result, retry if necessary
              const ai = await retryAIAnalysis(data);

              // Merging AI result into data and saving to the database
              await Property.updateOne(
                { _id },
                {
                  $set: {
                    ...data,
                    ...ai, // Merge AI data
                    isCleaned: true, // Mark as cleaned
                  },
                }
              );
              const finalData = {
                ...data,
                ...ai, // Merge AI data
                isCleaned: true, // Mark as cleaned
              };
              await updateUserPropertyDocuments(_id, finalData);
              console.log(`Property ${_id} updated successfully with AI data.`);
            } else {
              // If no matching property found in Domain API
              const imageBuffer = await getMapStaticImage(latitude, longitude);
              const aiResponse = await mapAerialImgAnalyze(imageBuffer);
              console.log("Maps aerial response");
              console.log(aiResponse);
              const data = {
                address: address.replace(/,? NSW.*$/, ""),
                listingType: "Sale",
                price: null,
                waterViews: aiResponse.waterViews,
                pool: aiResponse.pool,
                tennisCourt: aiResponse.tennisCourt,
                streetTraffic: aiResponse.streetTraffic,
                topography: aiResponse.topography,
                postcode: postcode,
                suburb: suburb?.toUpperCase(),
                latitude:latitude || null,
                longitude:longitude || null,
                propertyType: aiResponse.propertyType,
                channel: "residential",
                fetchMode: "manual",
                isCleaned: true, // Mark as cleaned
              };
              await Property.updateOne({ _id }, { $set: data });
              await updateUserPropertyDocuments(_id, data);
              console.log(
                `Property ${_id} updated successfully (No Domain API match).`
              );
            }
          } catch (propertyError) {
            console.error(
              `Error processing property ${_id}:`,
              propertyError.message
            );
            // Optionally, you can implement retry logic or mark the property for reprocessing
          }
        }
      } catch (error) {
        console.error("Error in cron job:", error.message);
      } finally {
        isJobRunning = false;
        console.log("Cron job ended at:", new Date().toISOString());
      }
    },
    {
      scheduled: true,
      timezone: "Australia/Sydney", // Set your desired timezone
    }
  );
};

async function updateUserPropertyDocuments(id, data) {
  try {
    const filter = { fkPropertyId: id, isCleaned: false };

    // Update UserProperty documents without affecting other fields
    const result = await UserProperty.updateMany(filter, { $set: data });

    console.log(
      `UserProperty documents for Property ID ${id} have been updated successfully. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`
    );
  } catch (error) {
    console.error(
      `Error updating UserProperty for Property ID ${id}:`,
      error.message
    );
    // Depending on your requirements, you might want to throw the error or handle it differently
    throw error;
  }
}

module.exports = startPropertyUpdaterCron;
