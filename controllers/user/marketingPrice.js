// controllers/marketingPriceController.js
const MarketingPrice = require("../../models/MarketingPrice");

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
exports.fetchReaPricingAPI = async (req,res) => {
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

exports.getAllMarketingPrices = async (req, res) => {
  try {
    const data = {
      suburb: "Peakhurst",
      state: "NSW",
      postcode: "2210",
      agency_id: "RPKRUK",
    };
    const res1=await fetchReaPricingAPI(data);
    console.log(res1)
    const marketingPrices = await MarketingPrice.find();
    res.status(200).json({ success: true, data: marketingPrices });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
