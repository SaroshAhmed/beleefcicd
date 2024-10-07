// routes/marketingPriceRoutes.js
const express = require('express');
const router = express.Router();
const { getAllMarketingPrices } = require('../../../controllers/user/marketingPrice');

router.get('/', getAllMarketingPrices);

module.exports = router;
