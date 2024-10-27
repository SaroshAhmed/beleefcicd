const express = require("express");
const router = express.Router();
const {
  createProperty,
  getPropertyByAddress,
  regenerateLogicalPrice,
  getAddresses,
  getPropertyByShareableLink,
} = require("../../../controllers/user/demo");
const { isAuthenticated } = require("../../../middleware/auth");

router.post("/", isAuthenticated, createProperty);
router.post("/regenerateLogicalPrice", isAuthenticated, regenerateLogicalPrice);
router.get("/addresses", getAddresses);
router.get("/:address", getPropertyByAddress);
router.get("/share/:shareableLink", getPropertyByShareableLink);
module.exports = router;
