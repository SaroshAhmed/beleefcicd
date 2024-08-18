// config.js
require("dotenv").config();

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  REACT_APP_FRONTNED_URL: process.env.REACT_APP_FRONTNED_URL,
  RESTRICTED_DOMAIN: process.env.RESTRICTED_DOMAIN,
  SECRET_KEY: process.env.SECRET_KEY,
  DOMAIN_API_KEY:process.env.DOMAIN_API_KEY,
  OPENAI_API_KEY:process.env.OPENAI_API_KEY
};
