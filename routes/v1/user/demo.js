const express = require("express");
const router = express.Router();
const {
  createProperty,
  getPropertyByAddress,
  regenerateLogicalPrice,
  getAddresses,
  getPropertyByShareableLink,
  updatePropertyByAddress
} = require("../../../controllers/user/demo");
const { isAuthenticated } = require("../../../middleware/auth");

router.post("/", isAuthenticated, createProperty);
router.post("/regenerateLogicalPrice", isAuthenticated, regenerateLogicalPrice);
router.get("/addresses", getAddresses);
router.put("/:address", updatePropertyByAddress);
router.get("/:address", getPropertyByAddress);
router.get("/share/:shareableLink", getPropertyByShareableLink);
module.exports = router;
