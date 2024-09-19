const mongoose = require("mongoose");
const Property = require("../../models/Property");
const cron = require("node-cron");

// const properties= Properties.findMany where isCleaned:false, fetchMode:"manual",
const {_id, address,  suburb,
  postcode,
  latitude,
  longitude}=properties
address += " NSW";

const updateProperty = async (
  address,
  suburb,
  postcode,
  latitude,
  longitude
) => {
  try {

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
      Array.isArray(response.data) && // Ensure response.data is an array
      response.data.length > 0 &&
      response.data[0]?.address?.toLowerCase().includes(suburb.toLowerCase())
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
        // No listingId found, proceed with AI analysis and property creation
        const imageBuffer = await getMapStaticImage(
          propertyDetails?.addressCoordinate.lat,
          propertyDetails?.addressCoordinate.lon
        );
        const aiResponse = await mapAerialImgAnalyze(imageBuffer);

        const property = await Property.update({
          address: propertyDetails?.address.replace(/,? NSW.*$/, ""),
          listingType: "Sale",
          price: null,
          waterViews: aiResponse.waterViews,
          pool:aiResponse.pool,
          tennisCourt:aiResponse.tennisCourt,
          streetTraffic:aiResponse.streetTraffic,
          topography:aiResponse.topography,
          postcode: propertyDetails?.postcode,
          suburb: propertyDetails?.suburb.toUpperCase(),
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
        });
        return property;
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
        if (error.response && error.response.status === 404) {
          // Handle 404 error by constructing the alternative data object
          const data = {
            listingId,
            address: propertyDetails?.address.replace(/,? NSW.*$/, ""),
            listingType: "Sale",
            // Corrected the assignment to a comparison operator
            beleefSaleProcess:
              propertyDetails?.status === "OffMarket" ? "Withdrawn" : null,
            postcode: propertyDetails?.postcode,
            suburb: propertyDetails?.suburb.toUpperCase(),
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
            // Ensure photos exist before mapping
            media:
              Array.isArray(propertyDetails?.photos) &&
              propertyDetails.photos.length > 0
                ? propertyDetails.photos.map((photo) => ({
                    category: "Image",
                    type: photo.imageType,
                    url: photo.fullUrl,
                  }))
                : [],
            // Add other necessary fields if required
          };

          // Create the property with the alternative data
          const property = await Property.update({
            ...data,
            channel: "residential",
            // Add other default or necessary fields
            fetchMode: "manual",
          });
          return property;
        } else {
          // For other errors, you might want to log them or handle differently
          console.error(`Error fetching listing details: ${error.message}`);
          throw error; // Re-throw the error if you want upstream handlers to catch it
        }
      }

      // If listing details are successfully fetched, proceed as usual
      const daysListed = listingDetails.saleDetails?.soldDetails?.soldDate
        ? calculateDaysListed(
            listingDetails.dateListed,
            listingDetails.saleDetails?.soldDetails?.soldDate
          )
        : null;

      const data = {
        listingId,
        address: propertyDetails?.address.replace(/,? NSW.*$/, ""),
        listingType: listingDetails.saleMode === "sold" ? "Sold" : "Sale",
        price: listingDetails.saleDetails?.soldDetails?.soldPrice || null,
        postcode: listingDetails.addressParts.postcode,
        suburb: listingDetails.addressParts.suburb.toUpperCase(),
        latitude: listingDetails.geoLocation.latitude,
        longitude: listingDetails.geoLocation.longitude,
        propertyType: listingDetails.propertyType,
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
        media: listingDetails.media, // Ensure media is properly formatted
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
      const property = await Property.update({
        ...data,
        // ...ai, // Uncomment if AI data is to be merged
        // isCleaned: true, // Uncomment if necessary
      });
      return property;
    } else {

      const imageBuffer = await getMapStaticImage(latitude, longitude);
      const aiResponse = await mapAerialImgAnalyze(imageBuffer);


      const property = await Property.update({
        address: address.replace(/,? NSW.*$/, ""),
        listingType: "Sale",
        price: null,
        waterViews: aiResponse.waterViews,
        pool:aiResponse.pool,
        tennisCourt:aiResponse.tennisCourt,
        streetTraffic:aiResponse.streetTraffic,
        topography:aiResponse.topography,
        postcode: postcode,
        suburb: suburb.toUpperCase(),
        latitude,
        longitude,
        propertyType: aiResponse.propertyType,
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


// can you convert this to a cron schedule
// it should run every 10 seconds but you should be able to maintain time
// like it starts running and suppose the Property update response takes 30 seconds
// then cron is every 10 seconds it shouldn't redo that same property you got it what I mean.
// for property update take where conditon as id coming from top getall results
