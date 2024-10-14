const axios = require("axios");
const AWS = require("aws-sdk");
const MarketingPrice = require("../models/MarketingPrice");
const Suburb = require("../models/Suburb");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();

const formatCurrency = (value) => {
  if (value === undefined || value === null) return "N/A";
  return "$" + new Intl.NumberFormat().format(value);
};

function formatDateToAEDT(date) {
  // If date is invalid or null, use current date and time
  const dateObj = date ? new Date(date) : new Date();

  // Options for date formatting
  const dateOptions = {
    timeZone: "Australia/Sydney",
    day: "2-digit",
    month: "short",
    year: "numeric",
  };

  const timeOptions = {
    timeZone: "Australia/Sydney",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short",
  };

  const dateFormatter = new Intl.DateTimeFormat("en-AU", dateOptions);
  const timeFormatter = new Intl.DateTimeFormat("en-AU", timeOptions);

  // Format date and time separately
  const formattedDate = dateFormatter.format(dateObj); // e.g., "17 Jun 2024"
  const formattedTimeWithZone = timeFormatter.format(dateObj); // e.g., "2:15 pm AEDT"

  // Extract time and timezone abbreviation
  const timeWithZoneParts = formattedTimeWithZone.split(" ");
  const time = timeWithZoneParts[0] + timeWithZoneParts[1].toLowerCase(); // "2:15pm"
  const timeZoneAbbreviation = timeWithZoneParts[2]; // "AEDT" or "AEST"

  // Split date into components
  const dateParts = formattedDate.split(" "); // ["17", "Jun", "2024"]
  const day = dateParts[0];
  const month = dateParts[1];
  const year = dateParts[2];

  // Construct the final formatted date
  const finalFormattedDate = `${day}/${month}/${year} ${time}(${timeZoneAbbreviation})`;

  return finalFormattedDate;
}

const getVendorSignatureUrl = async (signatureUrl) => {
  try {
    const urlObj = new URL(signatureUrl);
    // Remove the leading '/' from pathname to get the Key
    const key = urlObj.pathname.startsWith("/")
      ? urlObj.pathname.substring(1)
      : urlObj.pathname;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: 300, // URL expires in 5 minutes
    };

    // Generate signed URL to access the S3 object
    const signedUrl = s3.getSignedUrl("getObject", params);

    // Fetch the image from S3 using the signed URL
    const response = await axios.get(signedUrl, {
      responseType: "arraybuffer",
    });

    // Convert the image buffer to base64
    const base64Image = Buffer.from(response.data, "binary").toString("base64");

    // Return the base64 image in a data URL format
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error("Error generating base64 from signature URL:", error);
    throw new Error("Could not generate base64 image");
  }
};

// const getMarketingPrices = async (company, price, suburb) => {
//   try {
//     // Handle price range (like $1.9-2.1M)
//     let maxPrice = price.split("-")[1] || price; // Take the higher range
//     maxPrice = maxPrice.toUpperCase().replace("$", "").trim(); // Remove $ and spaces

//     // Convert the price from K/M format
//     if (maxPrice.includes("M")) {
//       maxPrice = parseFloat(maxPrice.replace("M", "")) * 1_000_000; // Convert 'M' to millions
//     } else if (maxPrice.includes("K")) {
//       maxPrice = parseFloat(maxPrice.replace("K", "")) * 1_000; // Convert 'K' to thousands
//     } else {
//       maxPrice = parseFloat(maxPrice); // Regular number conversion
//     }

//     // Fetch the suburb data from the database
//     const suburbData = await Suburb.findOne({
//       suburb: new RegExp(`^${suburb}$`, "i"), // Case-insensitive match
//     });
//     if (!suburbData) {
//       throw new Error( "Suburb not found")
//     }

//     const { reaPrice, domainPrice } = suburbData;

//     // Find the matching domainPrice range
//     const matchedPriceRange = domainPrice.find((range) => {
//       return maxPrice >= range.minPrice && maxPrice <= range.maxPrice;
//     });

//     if (!matchedPriceRange) {
//       throw new Error( "No matching price range found")
//     }

//     const domainFee = matchedPriceRange.fee;

//     // Fetch marketing prices from the database
//     let data = await MarketingPrice.find().lean();


//     // Remove the "I.M Group Pty Ltd (Licenced user of Ausrealty)" category if the company matches
//     if (company !== "I.M Group Pty Ltd (Licenced user of Ausrealty)") {
//       data = data.filter(
//         (item) =>
//           item.category !== "I.M Group"
//       );
//     }

//     data = data.map((item) => {
//       if (item.category === "Internet Portals") {
//         item.items = item.items.map((internetItem, index) => {
//           // Add reaPrice and domainFee to respective items
//           if (internetItem.name === "Realestate.com.au") {
//             internetItem.price = reaPrice ? parseFloat(reaPrice) : 0;
//           } else if (internetItem.name === "Domain.com.au") {
//             internetItem.price = domainFee ? parseFloat(domainFee) : 0;
//           }
    
//           // Add `isChecked` key and set it to `true` for the first two items
//           const updatedItem = {
//             ...internetItem,
//             isChecked: index < 2,
//           };
//           console.log("Updated Item:", updatedItem);
//           return updatedItem;
//         });
//       } else {
//         // Add `isChecked` key and set it to `false` for all items in other categories
//         item.items = item.items.map((categoryItem) => {
//           const updatedCategoryItem = {
//             ...categoryItem,
//             isChecked: false,
//           };
//           console.log("Updated Category Item:", updatedCategoryItem);
//           return updatedCategoryItem;
//         });
//       }
//       return item;
//     });
    

//     const marketing = {
//       categories: data,
//       agentContribution: {
//         amount: "$0",
//         isChecked: false,
//       },
//       total: parseFloat(reaPrice)+parseFloat(domainFee),
//     };

//     return marketing;
//   } catch (error) {
//     console.log("Error:", error.message);
//     throw error;
//   }
// };

const getMarketingPrices = async (company, price, suburb) => {
  try {
    // Set default values for reaPrice and domainPrice
    let reaPrice = 0;
    let domainFee = 0;

    // Handle case when price is not provided
    if (!price || price.trim() === "") {
      price = "0"; // Set price to 0 if not provided
    }

    // Handle price range (like $1.9-2.1M)
    let maxPrice = price.split("-")[1] || price; // Take the higher range
    maxPrice = maxPrice.toUpperCase().replace("$", "").trim(); // Remove $ and spaces

    // Convert the price from K/M format
    if (maxPrice.includes("M")) {
      maxPrice = parseFloat(maxPrice.replace("M", "")) * 1_000_000; // Convert 'M' to millions
    } else if (maxPrice.includes("K")) {
      maxPrice = parseFloat(maxPrice.replace("K", "")) * 1_000; // Convert 'K' to thousands
    } else {
      maxPrice = parseFloat(maxPrice); // Regular number conversion
    }

    // Fetch the suburb data from the database if suburb is provided
    if (suburb && suburb.trim() !== "") {
      const suburbData = await Suburb.findOne({
        suburb: new RegExp(`^${suburb}$`, "i"), // Case-insensitive match
      });

      if (suburbData) {
        reaPrice = suburbData.reaPrice;
        const matchedPriceRange = suburbData.domainPrice.find((range) => {
          return maxPrice >= range.minPrice && maxPrice <= range.maxPrice;
        });
        if (matchedPriceRange) {
          domainFee = matchedPriceRange.fee;
        }
      } else {
        console.log("Suburb not found, defaulting reaPrice and domainFee to 0");
      }
    } else {
      console.log("Suburb not provided, defaulting reaPrice and domainFee to 0");
    }

    // Fetch marketing prices from the database
    let data = await MarketingPrice.find().lean();

    // Remove the "I.M Group Pty Ltd (Licenced user of Ausrealty)" category if the company matches
    if (company !== "I.M Group Pty Ltd (Licenced user of Ausrealty)") {
      data = data.filter((item) => item.category !== "I.M Group");
    }

    data = data.map((item) => {
      if (item.category === "Internet Portals") {
        item.items = item.items.map((internetItem, index) => {
          // Add reaPrice and domainFee to respective items
          if (internetItem.name === "Realestate.com.au") {
            internetItem.price = reaPrice ? parseFloat(reaPrice) : 0;
          } else if (internetItem.name === "Domain.com.au") {
            internetItem.price = domainFee ? parseFloat(domainFee) : 0;
          }

          // Add `isChecked` key and set it to `true` for the first two items
          const updatedItem = {
            ...internetItem,
            isChecked: index < 2,
          };
          return updatedItem;
        });
      } else {
        // Add `isChecked` key and set it to `false` for all items in other categories
        item.items = item.items.map((categoryItem) => {
          const updatedCategoryItem = {
            ...categoryItem,
            isChecked: false,
          };
          return updatedCategoryItem;
        });
      }
      return item;
    });

    const marketing = {
      categories: data,
      agentContribution: {
        amount: "$0",
        isChecked: false,
      },
      total: parseFloat(reaPrice) + parseFloat(domainFee),
    };

    return marketing;
  } catch (error) {
    console.log("Error:", error.message);
    throw error;
  }
};


module.exports = {
  formatCurrency,
  formatDateToAEDT,
  getVendorSignatureUrl,
  getMarketingPrices,
};
