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