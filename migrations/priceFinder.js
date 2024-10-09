const Property = require("../models/Property");
const UserProperty = require("../models/UserProperty");
const PriceFinderProperties = require("../models/PriceFinderProperties");
const databaseConnect = require("../config/database");

// Connect to the database
databaseConnect();

// Function to update saleHistory and listingHistory
async function updatePropertyHistories() {
  try {
    // Step 1: Fetch all properties with address field
    const properties = await Property.find({}, "address");

    const abbreviationsMap = {
      ST: "STREET",
      AVE: "AVENUE",
      RD: "ROAD",
      BLVD: "BOULEVARD",
      // Add other common abbreviations here
    };

    const expandAbbreviation = (part) => {
      const words = part.split(" ");
      return words
        .map((word) => abbreviationsMap[word] || word) // Replace the abbreviation with its full form if found
        .join(" ");
    };

    for (const property of properties) {
      const { address } = property;

      // Step 2: Split the address into street and suburb from Property table
      const [streetAddress, suburb] = address
        .split(", ")
        .map((part) => expandAbbreviation(part.toUpperCase())); // Expand abbreviations

      if (!streetAddress || !suburb) {
        console.log(`Invalid address format for property: ${property._id}`);
        continue;
      }

      // Step 3: Query PriceFinderProperties using streetAddress and locality
      const matchingProperty = await PriceFinderProperties.findOne({
        "address.streetAddress": streetAddress,
        "address.locality": suburb,
      });

      if (matchingProperty) {
        const saleHistory = matchingProperty.saleHistory || [];
        const listingHistory = matchingProperty.listingHistory || [];

        // Step 4: Update the Property table
        await Property.updateOne(
          { _id: property._id },
          {
            $set: {
              saleHistory: saleHistory,
              listingHistory: listingHistory,
            },
          }
        );

        const userPropertiesExist = await UserProperty.countDocuments({
          address: address,
        });

        if (userPropertiesExist > 0) {
          await UserProperty.updateMany(
            { address: address }, // Find all entries with the same address
            {
              $set: {
                saleHistory: saleHistory,
                listingHistory: listingHistory,
              },
            }
          );
          console.log(`Updated UserProperty for address: ${address}`);
        } else {
          console.log(
            `No matching UserProperty found for address: ${address}, skipping update.`
          );
        }

        console.log(
          `Updated Property and UserProperty for address: ${address}`
        );
      } else {
        console.log(
          `No matching property found in PriceFinderProperties for: ${address}`
        );
      }
    }

    console.log("Property history update completed.");
  } catch (error) {
    console.error("Error updating property histories:", error);
  }
}

// Start the process to update histories
updatePropertyHistories();
