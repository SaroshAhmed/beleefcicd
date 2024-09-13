const express = require("express");
const router = express.Router();
const {
  createProperty,
  getPropertiesAddress,
  getPropertyByAddress,
  calculateScoreMatch,
  getAreaDynamics,
  getBeleefSaleProcess,
  regenerateLogicalPrice,
} = require("../../../controllers/user/property");
const { isAuthenticated } = require("../../../middleware/auth");

// Order matters! Place specific routes first
router.get("/beleefSaleProcess/:suburb", getBeleefSaleProcess); // <-- Specific route first
router.post("/", isAuthenticated, createProperty);
router.get("/address", isAuthenticated, getPropertiesAddress);
router.get("/suburb/:suburb", getAreaDynamics); // Specific dynamic route
router.post("/recommend", calculateScoreMatch);
router.post("/regenerateLogicalPrice", regenerateLogicalPrice);

// Catch-all dynamic route should be last
router.get("/address/:address", isAuthenticated, getPropertyByAddress); // <-- Dynamic route last

module.exports = router;
