// routes/marketingPriceRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllMarketingPrices,
  fetchReaPricingAPI,
} = require("../../../controllers/user/marketingPrice");
const { isAuthenticated } = require("../../../middleware/auth");

router.get('/:price/:suburb',isAuthenticated , getAllMarketingPrices);
router.get("/rea", fetchReaPricingAPI);
module.exports = router;
