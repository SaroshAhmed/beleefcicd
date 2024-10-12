const Suburb = require("../models/Suburb");
const axios = require("axios");
const { MONGO_URI } = require("../config");
const mongoose = require("mongoose");

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

const fetchReaPricingAPI = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });

      const validToken = await getToken(); // Fetch the token
      console.log("valid token", validToken);
  
      const apiUrl = "https://api.realestate.com.au/prices/v1/realestate-properties";
  
      // Fetch all suburbs with `reaPrice` set to `null`
      const suburbs = await Suburb.find({ reaPrice: null });

      // Loop through each suburb
      for (const suburbData of suburbs) {
        const { suburb, state, postcode } = suburbData;
        const agency_id = "RPKRUK"; // Static agency_id
  
        const params = {
          suburb,
          state,
          postcode,
          agency_id,
        };
  
        try {
          // Fetch pricing from REA API
          const response = await axios.get(apiUrl, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${validToken}`,
            },
            params: params,
          });
  
          // Check if the response contains data
          if (response.data && response.data.all && response.data.all.length > 0) {
            const reaPrice = Math.floor(response.data.all[0].price);
  
            // Update the suburb's `reaPrice` in MongoDB
            await Suburb.updateOne(
              { _id: suburbData._id }, // Find the suburb by its ID
              { $set: { reaPrice: reaPrice } } // Update the reaPrice field
            );
  
            console.log(`Updated suburb ${suburb} with REA price: ${reaPrice}`);
          } else {
            console.log(`No pricing data found for suburb ${suburb}`);
          }
        } catch (apiError) {
          console.error(`Error fetching price data for suburb ${suburb}:`, apiError);
        }
      }
  
      console.log("Completed fetching REA prices for all suburbs.");
    } catch (error) {
      console.error("Error fetching data from API:", error);
      throw error;
    }
  };
  
  // Call the function
  fetchReaPricingAPI();
  