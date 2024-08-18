const axios = require("axios");
const Suburb = require("../models/Suburb");
const Property = require("../models/Property");
const { DOMAIN_API_KEY } = require("../config");
const databaseConnect = require("../config/database");

databaseConnect();

// Step 1: Fetch each row from Suburb table and pass it to fetchListings function for both "Sale" and "Sold" listing types
async function processSuburbs() {
  try {
    const suburbs = await Suburb.find({ listingsFetched: false });

    for (const suburb of suburbs) {
      const { suburb: suburbName, postcode, state } = suburb;

      await processListingType("Sale", suburbName, postcode, state);
      await processListingType("Sold", suburbName, postcode, state);

      // Step 4: Update Suburb table after processing both listing types
      await Suburb.updateOne(
        { _id: suburb._id },
        { listingsFetched: true, listingsFetchedAt: new Date() }
      );
    }
  } catch (error) {
    console.error("Error processing suburbs:", error);
  }
}

// Step 2: Process listings for a specific listing type
async function processListingType(listingType, suburbName, postcode, state) {
  const listings = await fetchListings(
    listingType,
    suburbName,
    postcode,
    state
  );

  if (listings) {
    console.log(
      `Total ${listingType} listings for ${suburbName} (${postcode}): ${listings.length}`
    );
    const filteredListings = listings.filter(
      (listingWrapper) => !listingWrapper.listings
    );

    for (const listingWrapper of filteredListings) {
      const listing = listingWrapper.listing;

      try {
        await insertListing(listing);
      } catch (error) {
        console.error(
          `Error inserting listing with ID ${listing.id}:`,
          error.message
        );
        continue;
      }
    }
  }
}

// Step 3: Fetch Listings with Pagination Handling
async function fetchListings(listingType, suburb, postcode, state) {
  const allListings = [];
  let pageNumber = 1;
  let totalPages = 1;

  try {
    do {
      const response = await axios.post(
        "https://api.domain.com.au/v1/listings/residential/_search",
        {
          listingType,
          propertyTypes: [
            "ApartmentUnitFlat",
            "Duplex",
            "House",
            "Terrace",
            "Townhouse",
            "VacantLand",
            "Villa",
          ],
          listedSince: datePreviousYear(),
          locations: [
            {
              suburb,
              postcode,
              state,
            },
          ],
          pageSize: 100,
          pageNumber,
        },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-Api-Key": DOMAIN_API_KEY,
            "X-Api-Call-Source": "live-api-browser",
          },
        }
      );

      const listings = response.data;
      const totalCount = parseInt(response.headers["x-total-count"], 10); // Get total record count

      totalPages = Math.ceil(totalCount / 100);

      allListings.push(...listings); // Collect listings from this page

      pageNumber++; // Move to the next page
    } while (pageNumber <= totalPages);

    return allListings;
  } catch (error) {
    console.error(
      `Error fetching data for ${suburb} (${postcode}) [${listingType}]:`,
      error.message
    );
    throw error;
  }
}

// Step 4: Insert each listing into Property table
async function insertListing(listing) {
  try {
    // Calculate daysListed only if soldDate is present, otherwise set it to null
    const daysListed = listing.soldData?.soldDate
      ? calculateDaysListed(listing.dateListed, listing.soldData.soldDate)
      : null;

    const propertyData = {
      listingId: listing.id,
      address: listing.propertyDetails.displayableAddress,
      listingType: listing.listingType,
      price: listing.priceDetails?.price,
      postcode: listing.propertyDetails.postcode,
      suburb: listing.propertyDetails.suburb,
      latitude: listing.propertyDetails.latitude,
      longitude: listing.propertyDetails.longitude,
      propertyType: listing.propertyDetails.propertyType,
      bedrooms: listing.propertyDetails.bedrooms,
      bathrooms: listing.propertyDetails.bathrooms,
      carspaces: listing.propertyDetails.carspaces,
      landArea: listing.propertyDetails.landArea,
      features: listing.propertyDetails.features,
      dateListed: listing.dateListed,
      daysListed,
    };

    await Property.create(propertyData);
  } catch (error) {
    console.error(`Error inserting listing with ID ${listing.id}:`, error);
    throw error;
  }
}

// Helper Function to Calculate Days Listed
function calculateDaysListed(dateListed, soldDate) {
  const listedDate = new Date(dateListed);
  const soldDateObject = new Date(soldDate);
  const diffTime = Math.abs(soldDateObject - listedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Helper Function to Calculate Previous Date
function datePreviousYear() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const year = oneYearAgo.getFullYear();
  const month = String(oneYearAgo.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so add 1
  const day = String(oneYearAgo.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

// Run the process
processSuburbs();
