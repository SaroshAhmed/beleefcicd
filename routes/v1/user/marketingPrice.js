// routes/marketingPriceRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllMarketingPrices,
  fetchReaPricingAPI,
} = require("../../../controllers/user/marketingPrice");

router.get("/", getAllMarketingPrices);
router.get("/rea", fetchReaPricingAPI);
module.exports = router;
