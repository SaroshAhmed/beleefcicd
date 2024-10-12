// controllers/marketingPriceController.js
const MarketingPrice = require("../../models/MarketingPrice");
const Suburb = require("../../models/Suburb");

const axios = require("axios");

let token = null;
let tokenExpirationTime = null;

// Function to fetch a new token
const fetchNewToken = async () => {
  try {
    const tokenResponse = await axios.post(
      "https://api.realestate.com.au/oauth/token",

      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        auth: {
          username: "32ced833-9750-413d-8149-4e77a9aa9016",
          password: "2a130eba-bc13-408f-9c82-5b92a301bd87",
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    token = tokenResponse.data.access_token; // Save the new token
    const expiresIn = tokenResponse.data.expires_in; // Get expiration time
    tokenExpirationTime = Date.now() + expiresIn * 1000; // Set expiration time in milliseconds

    return token;
  } catch (error) {
    console.error("Error fetching token:", error);
    throw new Error("Unable to fetch token");
  }
};

// Function to get a valid token
const getToken = async () => {
  if (!token || Date.now() >= tokenExpirationTime) {
    return await fetchNewToken();
  }
  return token;
};

// Controller function to fetch data from REA
exports.fetchReaPricingAPI = async (req, res) => {
  try {
    const validToken = await getToken();
    console.log("valid token", validToken);
    const apiUrl =
      "https://api.realestate.com.au/prices/v1/realestate-properties";

    const { suburb, state, postcode, agency_id } = req.query;

    const params = {
      suburb,
      state,
      postcode,
      agency_id,
    };
    const response = await axios.get(apiUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${validToken}`,
      },
      params: params,
    });
    // return response.data
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error("Error fetching data from API:", error);
    throw error;
  }
};

// exports.getAllMarketingPrices = async (req, res) => {
//   try {
//     const { price, suburb } = req.params;
// price looks like this $1.9-2.1M
// split take higher range if K add 000 or M add six zeros

//     const response = await Suburb.findOne({
//   suburb
//     });

//     from response get reaPrice and domainPrice

// reaPrice
// "2509"

// domainPrice
// Array (3)

// 0
// Object
// minPrice
// 0
// maxPrice
// 999999
// fee
// 1705

// 1
// Object
// minPrice
// 1000000
// maxPrice
// 2749999
// fee
// 2500

// 2
// Object
// minPrice
// 2750000
// maxPrice
// 9999999999
// fee
// 3000

// now matching domain range get that fee

// if have to find Internet Portals category and update Realestate.com.au (rea) price and domain.com.au price
// const data = [
//   {
//     category: "Mailcards & Brochures",
//     items: [
//       { name: "Melo A6 Mailcard Double Sided Colour - Landscape - 300gsm Uncoated Bright White", price: 388 },
//       { name: "Melo 16 Page A4 Booklet - 300gsm Uncoated Bright White Landscape (Short Edge Bound)", price: 358 },
//       { name: "Melo 8 Page A5 Brochure - 300gsm Uncoated Bright White Landscape (Short Edge Bound)", price: 106 }
//     ]
//   },
//   {
//     category: "Photos",
//     items: [
//       { name: "Melo Photography - Photography 10 Images", price: 430 },
//       { name: "Melo Photography - Photography 20 Images", price: 730 },
//       { name: "Melo Photography - Photography 7 Images", price: 340 },
//       { name: "Melo Photography - Photography 5 Images", price: 280 },
//       { name: "Melo Photography - Dusk Photography", price: 160 },
//       { name: "Melo Photography - Drone Shots", price: 250 },
//       { name: "Melo Photography - Virtual Furniture 2 Images", price: 154 },
//       { name: "Melo Photography - Virtual Furniture 4 Images", price: 308 }
//     ]
//   },
//   {
//     category: "Floorplans",
//     items: [
//       { name: "Melo - Large Floor Plan", price: 319 },
//       { name: "Melo - Medium Floor Plan", price: 242 },
//       { name: "Melo - Small Floor Plan", price: 193 },
//       { name: "Melo - Redraw Large Floorplan", price: 198 },
//       { name: "Melo - Redraw Medium Floorplan", price: 143 },
//       { name: "Melo - Redraw Small Floorplan", price: 99 }
//     ]
//   },
//   {
//     category: "Video",
//     items: [
//       { name: "Melo - Property Video", price: 1150 },
//       { name: "Melo - Storytelling Videos", price: 2200 }
//     ]
//   },
//   {
//     category: "Copy & social media",
//     items: [
//       { name: "Melo - Property Copywriting", price: 140 },
//       { name: "Melo - Social Media Advertising", price: 300 }
//     ]
//   },
//   {
//     category: "Signboards",
//     items: [
//       { name: "Melo - 8x4 Satin Laminated Edge Wrap Signboard", price: 375 },
//       { name: "Melo - 8x6 Satin Laminated Edge Wrap Signboard", price: 780 },
//       { name: "Melo - 8x4 Solar Illuminated Signboard", price: 830 },
//       { name: "Melo - 8x6 Solar Illuminated Signboard", price: 1112 }
//     ]
//   },
//   {
//     category: "Internet Portals",
//     items: [
//       { name: "Realestate.com.au", price: 0 },
//       { name: "Domain.com.au", price: 0 },
//       { name: "Campaign Fee", price: 40 }
//     ]
//   },
//   {
//     category: "Auctioneer",
//     items: [
//       { name: "Narz Sayed - Auctioneer", price: 550 },
//       { name: "Andrew Cooley Auctioneer", price: 995 }
//     ]
//   },
//   {
//     category: "I.M Group",
//     items: [
//       { name: "The Merjan Group Package", price: 1500 },
//       { name: "The Merjan Group Package with video", price: 2274 },
//       { name: "I.M Group Pty Ltd *realestate.com.au (Portal Export)", price: 2200 },
//       { name: "I.M Group Pty Ltd domain.com.au (API) - Existing Build", price: 250 },
//       { name: "The Merjan Group Auctioneer", price: 795 },
//       { name: "The Merjan Group DL Package", price: 532 }
//     ]
//   }
// ];

//     const marketingPrices = await MarketingPrice.find();
//     res.status(200).json({ success: true, data: marketingPrices });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

exports.getAllMarketingPrices = async (req, res) => {
  try {
    const { company } = req.user;
    const { price, suburb } = req.params;

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

    // Fetch the suburb data from the database
    const suburbData = await Suburb.findOne({ 
      suburb: new RegExp(`^${suburb}$`, 'i') // Case-insensitive match
    });
    if (!suburbData) {
      return res
        .status(404)
        .json({ success: false, message: "Suburb not found" });
    }

    const { reaPrice, domainPrice } = suburbData;

    // Find the matching domainPrice range
    const matchedPriceRange = domainPrice.find((range) => {
      return maxPrice >= range.minPrice && maxPrice <= range.maxPrice;
    });

    if (!matchedPriceRange) {
      return res
        .status(404)
        .json({ success: false, message: "No matching price range found" });
    }

    const domainFee = matchedPriceRange.fee;

    // Fetch marketing prices from the database
    let data = await MarketingPrice.find();

    // Remove the "I.M Group Pty Ltd (Licenced user of Ausrealty)" category if the company matches
    if (company !== "I.M Group Pty Ltd (Licenced user of Ausrealty)") {
      data = data.filter(
        (item) =>
          item.category !== "I.M Group Pty Ltd (Licenced user of Ausrealty)"
      );
    }

    // Update "Internet Portals" category with reaPrice and domainFee
    data = data.map((item) => {
      if (item.category === "Internet Portals") {
        item.items = item.items.map((internetItem) => {
          if (internetItem.name === "Realestate.com.au") {
            internetItem.price = reaPrice ? parseFloat(reaPrice) : 0;
          } else if (internetItem.name === "Domain.com.au") {
            internetItem.price = domainFee ? parseFloat(domainFee) : 0;
          }
          return internetItem;
        });
      }
      return item;
    });

    // Return the modified data including updated Internet Portals prices
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
